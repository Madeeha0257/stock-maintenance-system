package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.entity.PurchaseOrder;
import com.licet.stockmaintenance.service.PurchaseOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(
            PurchaseOrderService purchaseOrderService
    ) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    public ResponseEntity<?> createPurchaseOrder(
            @RequestBody PurchaseOrder purchaseOrder
    ) {
        try {
            PurchaseOrder created =
                    purchaseOrderService.createPurchaseOrder(purchaseOrder);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(
                purchaseOrderService.getAllPurchaseOrders()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPurchaseOrderById(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    purchaseOrderService.getPurchaseOrderById(id)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<?> receivePurchaseOrder(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    purchaseOrderService.receivePurchaseOrder(id)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (IllegalStateException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}