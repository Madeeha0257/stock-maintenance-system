package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.entity.Inventory;
import com.licet.stockmaintenance.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final ProductService productService;

    public InventoryController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable Long productId) {
        return productService.getInventoryByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}/available")
    public ResponseEntity<Boolean> checkStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {

        return ResponseEntity.ok(
                productService.isStockAvailable(productId, quantity)
        );
    }

    @PutMapping("/product/{productId}")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {

        if (quantity < 0) {
            return ResponseEntity.badRequest().build();
        }

        return productService.updateStock(productId, quantity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}/low-stock")
    public ResponseEntity<Boolean> checkLowStock(@PathVariable Long productId) {
        return ResponseEntity.ok(
                productService.isLowStock(productId)
        );
    }
}