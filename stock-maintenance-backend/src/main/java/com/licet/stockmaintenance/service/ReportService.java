package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Bill;
import com.licet.stockmaintenance.entity.BillItem;
import com.licet.stockmaintenance.entity.Customer;
import com.licet.stockmaintenance.entity.Dealer;
import com.licet.stockmaintenance.entity.Inventory;
import com.licet.stockmaintenance.entity.Payment;
import com.licet.stockmaintenance.entity.Product;
import com.licet.stockmaintenance.entity.PurchaseOrder;
import com.licet.stockmaintenance.entity.PurchaseOrderItem;
import com.licet.stockmaintenance.repository.BillRepository;
import com.licet.stockmaintenance.repository.CustomerRepository;
import com.licet.stockmaintenance.repository.DealerRepository;
import com.licet.stockmaintenance.repository.InventoryRepository;
import com.licet.stockmaintenance.repository.ProductRepository;
import com.licet.stockmaintenance.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final DealerRepository dealerRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public ReportService(
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            BillRepository billRepository,
            CustomerRepository customerRepository,
            DealerRepository dealerRepository,
            PurchaseOrderRepository purchaseOrderRepository) {

        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.billRepository = billRepository;
        this.customerRepository = customerRepository;
        this.dealerRepository = dealerRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // ---------------------------------------------------------
    // STOCK REPORT
    // ---------------------------------------------------------

    public Map<String, Object> getStockReport() {

        List<Product> products = productRepository.findAll();

        List<Map<String, Object>> rows = new ArrayList<>();

        BigDecimal totalStockValue = BigDecimal.ZERO;
        long totalUnits = 0;
        long outOfStock = 0;
        long lowStock = 0;
        long productsMissingCost = 0;

        for (Product product : products) {

            Inventory inventory = product.getInventory();

            int stockQuantity = inventory != null && inventory.getStockQuantity() != null
                    ? inventory.getStockQuantity()
                    : 0;

            BigDecimal costPrice = product.getCostPrice();

            boolean costMissing = costPrice == null
                    || costPrice.compareTo(BigDecimal.ZERO) == 0;

            BigDecimal stockValue = null;

            if (!costMissing) {
                stockValue = costPrice.multiply(
                        BigDecimal.valueOf(stockQuantity)
                );

                totalStockValue = totalStockValue.add(stockValue);
            } else {
                productsMissingCost++;
            }

            String stockStatus = getStockStatus(stockQuantity);

            if (stockQuantity == 0) {
                outOfStock++;
            } else if (stockQuantity <= 10) {
                lowStock++;
            }

            totalUnits += stockQuantity;

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("productID", product.getProductID());
            row.put("productName", product.getProductName());
            row.put("category", product.getCategory());

            row.put(
                    "dealer",
                    product.getDealer() != null
                            ? product.getDealer().getDealerName()
                            : "Not assigned"
            );

            row.put("costPrice", costPrice);
            row.put("sellingPrice", product.getUnitPrice());
            row.put("currentStock", stockQuantity);
            row.put("stockValue", stockValue);
            row.put("stockStatus", stockStatus);
            row.put(
                    "costInformation",
                    costMissing ? "Missing cost information" : "Available"
            );

            rows.add(row);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalProducts", products.size());
        result.put("totalUnits", totalUnits);
        result.put("totalInventoryCostValue", totalStockValue);
        result.put("outOfStock", outOfStock);
        result.put("lowStock", lowStock);
        result.put("productsMissingCost", productsMissingCost);
        result.put("products", rows);

        return result;
    }

    // ---------------------------------------------------------
    // SALES REPORT
    // ---------------------------------------------------------

    public Map<String, Object> getSalesReport(
            LocalDate startDate,
            LocalDate endDate) {

        validateDateRange(startDate, endDate);

        List<Bill> bills = getBillsForDateRange(startDate, endDate);

        List<Map<String, Object>> rows = new ArrayList<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (Bill bill : bills) {

            Payment payment = bill.getPayment();

            String paymentMethod = payment != null
                    ? payment.getPaymentMethod()
                    : "N/A";

            for (BillItem item : bill.getBillItems()) {

                BigDecimal revenue = item.getSubtotal();

                if (revenue == null) {
                    revenue = BigDecimal.ZERO;
                }

                totalRevenue = totalRevenue.add(revenue);

                if (item.getQuantity() != null) {
                    totalItemsSold += item.getQuantity();
                }

                Map<String, Object> row = new LinkedHashMap<>();

                row.put("billID", bill.getBillID());
                row.put("date", bill.getBillDate());
                row.put(
                        "product",
                        item.getProduct() != null
                                ? item.getProduct().getProductName()
                                : "Unknown"
                );
                row.put("quantitySold", item.getQuantity());
                row.put("sellingPrice", item.getPrice());
                row.put("revenue", revenue);
                row.put("paymentMethod", paymentMethod);

                rows.add(row);
            }
        }

        long totalOrders = bills.size();

        BigDecimal averageBillValue = totalOrders == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(
                        BigDecimal.valueOf(totalOrders),
                        2,
                        RoundingMode.HALF_UP
                );

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", totalOrders);
        result.put("totalItemsSold", totalItemsSold);
        result.put("averageBillValue", averageBillValue);
        result.put("sales", rows);

        return result;
    }

    // ---------------------------------------------------------
    // DEALER REPORT
    // ---------------------------------------------------------

    public List<Map<String, Object>> getDealerReports() {

        List<Dealer> dealers = dealerRepository.findAll();
        List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findAll();

        List<Map<String, Object>> reports = new ArrayList<>();

        for (Dealer dealer : dealers) {

            Map<String, Object> dealerReport = new LinkedHashMap<>();

            dealerReport.put("dealerID", dealer.getDealerID());
            dealerReport.put("dealerName", dealer.getDealerName());
            dealerReport.put("phone", dealer.getPhone());
            dealerReport.put("address", dealer.getAddress());

            List<Map<String, Object>> suppliedProducts = new ArrayList<>();

            for (Product product : dealer.getProducts()) {

                Map<String, Object> productData = new LinkedHashMap<>();

                productData.put("productID", product.getProductID());
                productData.put("productName", product.getProductName());
                productData.put("category", product.getCategory());

                suppliedProducts.add(productData);
            }

            dealerReport.put("suppliedProducts", suppliedProducts);

            List<Map<String, Object>> orders = new ArrayList<>();

            for (PurchaseOrder order : purchaseOrders) {

                if (order.getDealer() == null
                        || !dealer.getDealerID().equals(
                                order.getDealer().getDealerID())) {
                    continue;
                }

                Map<String, Object> orderData = new LinkedHashMap<>();

                orderData.put(
                        "purchaseOrderID",
                        order.getPurchaseOrderID()
                );
                orderData.put("orderDate", order.getOrderDate());
                orderData.put("status", order.getStatus());
                orderData.put("totalAmount", order.getTotalAmount());

                List<Map<String, Object>> items = new ArrayList<>();

                for (PurchaseOrderItem item : order.getItems()) {

                    Map<String, Object> itemData = new LinkedHashMap<>();

                    itemData.put(
                            "product",
                            item.getProduct() != null
                                    ? item.getProduct().getProductName()
                                    : "Unknown"
                    );
                    itemData.put("quantity", item.getQuantity());
                    itemData.put("unitPrice", item.getUnitPrice());
                    itemData.put("subtotal", item.getSubtotal());

                    items.add(itemData);
                }

                orderData.put("items", items);

                orders.add(orderData);
            }

            dealerReport.put("purchaseOrders", orders);

            reports.add(dealerReport);
        }

        return reports;
    }

    // ---------------------------------------------------------
    // CUSTOMER REPORT
    // ---------------------------------------------------------

    public Map<String, Object> getCustomerReport(Long customerID) {

        Customer customer = customerRepository.findById(customerID)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer not found"
                        ));

        List<Map<String, Object>> purchases = new ArrayList<>();

        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Bill bill : customer.getBills()) {

            if (bill.getTotalAmount() != null) {
                totalSpent = totalSpent.add(bill.getTotalAmount());
            }

            Map<String, Object> billData = new LinkedHashMap<>();

            billData.put("billID", bill.getBillID());
            billData.put("date", bill.getBillDate());
            billData.put("totalAmount", bill.getTotalAmount());

            Payment payment = bill.getPayment();

            billData.put(
                    "paymentMethod",
                    payment != null
                            ? payment.getPaymentMethod()
                            : "N/A"
            );

            List<Map<String, Object>> items = new ArrayList<>();

            for (BillItem item : bill.getBillItems()) {

                Map<String, Object> itemData = new LinkedHashMap<>();

                itemData.put(
                        "product",
                        item.getProduct() != null
                                ? item.getProduct().getProductName()
                                : "Unknown"
                );
                itemData.put("quantity", item.getQuantity());
                itemData.put("sellingPrice", item.getPrice());
                itemData.put("subtotal", item.getSubtotal());

                items.add(itemData);
            }

            billData.put("items", items);

            purchases.add(billData);
        }

        long totalOrders = purchases.size();

        BigDecimal averageOrder = totalOrders == 0
                ? BigDecimal.ZERO
                : totalSpent.divide(
                        BigDecimal.valueOf(totalOrders),
                        2,
                        RoundingMode.HALF_UP
                );

        Map<String, Object> result = new LinkedHashMap<>();

        Map<String, Object> customerData = new LinkedHashMap<>();

        customerData.put("customerID", customer.getCustomerID());
        customerData.put("customerName", customer.getCustomerName());
        customerData.put("phone", customer.getPhone());

        result.put("customer", customerData);
        result.put("totalOrders", totalOrders);
        result.put("totalSpent", totalSpent);
        result.put("averageOrder", averageOrder);
        result.put("purchases", purchases);

        return result;
    }

    // ---------------------------------------------------------
    // INVENTORY VALUATION
    // ---------------------------------------------------------

    public Map<String, Object> getInventoryValuation() {

        List<Product> products = productRepository.findAll();

        List<Map<String, Object>> rows = new ArrayList<>();

        BigDecimal totalValuation = BigDecimal.ZERO;
        long productsMissingCost = 0;

        for (Product product : products) {

            Inventory inventory = product.getInventory();

            int stockQuantity = inventory != null
                    && inventory.getStockQuantity() != null
                    ? inventory.getStockQuantity()
                    : 0;

            BigDecimal costPrice = product.getCostPrice();

            boolean costMissing = costPrice == null
                    || costPrice.compareTo(BigDecimal.ZERO) == 0;

            BigDecimal stockValue = null;

            if (!costMissing) {
                stockValue = costPrice.multiply(
                        BigDecimal.valueOf(stockQuantity)
                );

                totalValuation = totalValuation.add(stockValue);
            } else {
                productsMissingCost++;
            }

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("productID", product.getProductID());
            row.put("productName", product.getProductName());
            row.put("category", product.getCategory());
            row.put("currentStock", stockQuantity);
            row.put("costPrice", costPrice);
            row.put("stockValue", stockValue);
            row.put(
                    "costInformation",
                    costMissing ? "Missing cost information" : "Available"
            );

            rows.add(row);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalValuation", totalValuation);
        result.put("productsMissingCost", productsMissingCost);
        result.put("valuationBasis", "Current cost price");
        result.put("products", rows);

        return result;
    }

    // ---------------------------------------------------------
    // PROFIT REPORT
    // ---------------------------------------------------------

    public Map<String, Object> getProfitReport(
            LocalDate startDate,
            LocalDate endDate) {

        validateDateRange(startDate, endDate);

        List<Bill> bills = getBillsForDateRange(startDate, endDate);

        List<Map<String, Object>> rows = new ArrayList<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalEstimatedCost = BigDecimal.ZERO;
        BigDecimal totalEstimatedProfit = BigDecimal.ZERO;

        long productsMissingCost = 0;

        for (Bill bill : bills) {

            for (BillItem item : bill.getBillItems()) {

                BigDecimal revenue = item.getSubtotal();

                if (revenue == null) {
                    revenue = BigDecimal.ZERO;
                }

                Product product = item.getProduct();

                BigDecimal costPrice = product != null
                        ? product.getCostPrice()
                        : null;

                boolean costMissing = costPrice == null
                        || costPrice.compareTo(BigDecimal.ZERO) == 0;

                BigDecimal estimatedCost = null;
                BigDecimal estimatedProfit = null;

                if (!costMissing && item.getQuantity() != null) {

                    estimatedCost = costPrice.multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    );

                    estimatedProfit = revenue.subtract(estimatedCost);

                    totalEstimatedCost =
                            totalEstimatedCost.add(estimatedCost);

                    totalEstimatedProfit =
                            totalEstimatedProfit.add(estimatedProfit);
                }

                totalRevenue = totalRevenue.add(revenue);

                if (costMissing) {
                    productsMissingCost++;
                }

                Map<String, Object> row = new LinkedHashMap<>();

                row.put("billID", bill.getBillID());
                row.put("date", bill.getBillDate());
                row.put(
                        "product",
                        product != null
                                ? product.getProductName()
                                : "Unknown"
                );
                row.put("quantitySold", item.getQuantity());
                row.put("sellingPrice", item.getPrice());
                row.put("revenue", revenue);
                row.put("costPrice", costPrice);
                row.put("estimatedCost", estimatedCost);
                row.put("estimatedProfit", estimatedProfit);
                row.put(
                        "costInformation",
                        costMissing
                                ? "Missing cost information"
                                : "Available"
                );

                rows.add(row);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalRevenue", totalRevenue);
        result.put("totalEstimatedCost", totalEstimatedCost);
        result.put("totalEstimatedProfit", totalEstimatedProfit);
        result.put("productsMissingCost", productsMissingCost);
        result.put(
                "profitBasis",
                "Estimated profit using current Product cost price"
        );
        result.put("sales", rows);

        return result;
    }

    // ---------------------------------------------------------
    // HELPER METHODS
    // ---------------------------------------------------------

    private List<Bill> getBillsForDateRange(
            LocalDate startDate,
            LocalDate endDate) {

        LocalDateTime startDateTime = startDate.atStartOfDay();

        LocalDateTime endDateTime = endDate
                .plusDays(1)
                .atStartOfDay()
                .minusNanos(1);

        return billRepository.findByBillDateBetween(
                startDateTime,
                endDateTime
        );
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }

    private String getStockStatus(int stockQuantity) {

        if (stockQuantity == 0) {
            return "Out of Stock";
        }

        if (stockQuantity <= 10) {
            return "Low Stock";
        }

        return "In Stock";
    }
}