package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Dealer;
import com.licet.stockmaintenance.entity.Inventory;
import com.licet.stockmaintenance.entity.Product;
import com.licet.stockmaintenance.entity.PurchaseOrder;
import com.licet.stockmaintenance.entity.PurchaseOrderItem;
import com.licet.stockmaintenance.entity.PurchaseOrderStatus;
import com.licet.stockmaintenance.repository.DealerRepository;
import com.licet.stockmaintenance.repository.InventoryRepository;
import com.licet.stockmaintenance.repository.ProductRepository;
import com.licet.stockmaintenance.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final DealerRepository dealerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            DealerRepository dealerRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.dealerRepository = dealerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder) {

        if (purchaseOrder == null) {
            throw new IllegalArgumentException("Purchase order is required");
        }

        if (purchaseOrder.getDealer() == null ||
                purchaseOrder.getDealer().getDealerID() == null) {
            throw new IllegalArgumentException("Dealer is required");
        }

        Dealer dealer = dealerRepository.findById(
                purchaseOrder.getDealer().getDealerID()
        ).orElseThrow(() ->
                new IllegalArgumentException("Dealer not found")
        );

        List<PurchaseOrderItem> items = purchaseOrder.getItems();

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one product is required"
            );
        }

        Set<Long> productIDs = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderItem item : items) {

            if (item == null) {
                throw new IllegalArgumentException(
                        "Invalid purchase order item"
                );
            }

            if (item.getProduct() == null ||
                    item.getProduct().getProductID() == null) {
                throw new IllegalArgumentException(
                        "Product is required for every item"
                );
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Quantity must be greater than 0"
                );
            }

            Long productID = item.getProduct().getProductID();

            if (!productIDs.add(productID)) {
                throw new IllegalArgumentException(
                        "The same product cannot be added more than once"
                );
            }

            Product product = productRepository.findById(productID)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: " + productID
                            )
                    );

            BigDecimal unitPrice = product.getCostPrice();

            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(
                        "Product cost price is not available"
                );
            }

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(item.getQuantity())
            );

            item.setProduct(product);
            item.setUnitPrice(unitPrice);
            item.setSubtotal(subtotal);
            item.setPurchaseOrder(purchaseOrder);

            totalAmount = totalAmount.add(subtotal);
        }

        purchaseOrder.setDealer(dealer);
        purchaseOrder.setOrderDate(LocalDateTime.now());
        purchaseOrder.setStatus(PurchaseOrderStatus.PENDING);
        purchaseOrder.setTotalAmount(totalAmount);

        return purchaseOrderRepository.save(purchaseOrder);
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getPurchaseOrderById(Long id) {

        return purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Purchase order not found"
                        )
                );
    }

    @Transactional
    public PurchaseOrder receivePurchaseOrder(Long id) {

        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Purchase order not found"
                        )
                );

        if (purchaseOrder.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new IllegalStateException(
                    "Purchase order has already been received"
            );
        }

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending purchase orders can be received"
            );
        }

        List<PurchaseOrderItem> items = purchaseOrder.getItems();

        if (items == null || items.isEmpty()) {
            throw new IllegalStateException(
                    "Purchase order has no items"
            );
        }

        for (PurchaseOrderItem item : items) {

            if (item.getProduct() == null ||
                    item.getProduct().getProductID() == null) {
                throw new IllegalStateException(
                        "Purchase order contains an invalid product"
                );
            }

            Inventory inventory = inventoryRepository
                    .findByProductProductID(
                            item.getProduct().getProductID()
                    )
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Inventory not found for product: "
                                            + item.getProduct().getProductID()
                            )
                    );

            int currentStock = inventory.getStockQuantity() == null
                    ? 0
                    : inventory.getStockQuantity();

            inventory.setStockQuantity(
                    currentStock + item.getQuantity()
            );

            inventoryRepository.save(inventory);
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.RECEIVED);

        return purchaseOrderRepository.save(purchaseOrder);
    }
}