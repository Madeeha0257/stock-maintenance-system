package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Bill;
import com.licet.stockmaintenance.entity.BillItem;
import com.licet.stockmaintenance.entity.Inventory;
import com.licet.stockmaintenance.entity.Payment;
import com.licet.stockmaintenance.entity.Product;
import com.licet.stockmaintenance.repository.BillRepository;
import com.licet.stockmaintenance.repository.InventoryRepository;
import com.licet.stockmaintenance.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public BillingService(
            BillRepository billRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository) {
        this.billRepository = billRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public Bill createBill(List<BillRequestItem> items, String paymentMethod) {

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Bill must contain at least one product.");
        }

        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new IllegalArgumentException("Payment method is required.");
        }

        Bill bill = new Bill();
        bill.setBillDate(LocalDateTime.now());

        List<BillItem> billItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (BillRequestItem requestItem : items) {

            if (requestItem.getProductID() == null) {
                throw new IllegalArgumentException("Product ID is required.");
            }

            if (requestItem.getQuantity() == null || requestItem.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Quantity must be greater than 0."
                );
            }

            Product product = productRepository.findById(requestItem.getProductID())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + requestItem.getProductID()
                    ));

            Inventory inventory = inventoryRepository
                    .findByProductProductID(product.getProductID())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Inventory not found for product: "
                                    + product.getProductName()
                    ));

            int requestedQuantity = requestItem.getQuantity();

            if (requestedQuantity > inventory.getStockQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getProductName()
                                + ". Available stock: "
                                + inventory.getStockQuantity()
                );
            }

            BigDecimal price = product.getUnitPrice();

            BigDecimal subtotal = price.multiply(
                    BigDecimal.valueOf(requestedQuantity)
            );

            BillItem billItem = new BillItem();
            billItem.setBill(bill);
            billItem.setProduct(product);
            billItem.setQuantity(requestedQuantity);
            billItem.setPrice(price);
            billItem.setSubtotal(subtotal);

            billItems.add(billItem);

            totalAmount = totalAmount.add(subtotal);

            inventory.setStockQuantity(
                    inventory.getStockQuantity() - requestedQuantity
            );
            inventory.setLastUpdated(LocalDateTime.now());

            inventoryRepository.save(inventory);
        }

        bill.setTotalAmount(totalAmount);
        bill.setBillItems(billItems);

        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(totalAmount);
        payment.setPaymentDate(LocalDateTime.now());

        bill.setPayment(payment);

        return billRepository.save(bill);
    }

    public static class BillRequestItem {

        private Long productID;
        private Integer quantity;

        public BillRequestItem() {
        }

        public Long getProductID() {
            return productID;
        }

        public void setProductID(Long productID) {
            this.productID = productID;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}