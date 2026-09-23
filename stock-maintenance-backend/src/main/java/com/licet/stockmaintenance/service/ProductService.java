package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Inventory;
import com.licet.stockmaintenance.entity.Product;
import com.licet.stockmaintenance.repository.InventoryRepository;
import com.licet.stockmaintenance.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public ProductService(ProductRepository productRepository,
                          InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public Product createProduct(Product product) {

        if (product.getProductName() == null || product.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }

        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be empty");
        }

        if (product.getUnitPrice() == null || product.getUnitPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unit price must be greater than 0");
        }

        if (product.getQuantity() == null || product.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setStockQuantity(product.getQuantity());
        inventory.setLastUpdated(LocalDateTime.now());

        inventoryRepository.save(inventory);

        savedProduct.setInventory(inventory);

        return savedProduct;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Optional<Product> updateProduct(Long id, Product updatedProduct) {

        return productRepository.findById(id).map(existingProduct -> {

            existingProduct.setProductName(updatedProduct.getProductName());
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setUnitPrice(updatedProduct.getUnitPrice());
            existingProduct.setQuantity(updatedProduct.getQuantity());

            Product savedProduct = productRepository.save(existingProduct);

            Inventory inventory = inventoryRepository
                    .findByProductProductID(id)
                    .orElseThrow();

            inventory.setStockQuantity(updatedProduct.getQuantity());
            inventory.setLastUpdated(java.time.LocalDateTime.now());

            inventoryRepository.save(inventory);

            return savedProduct;
        });
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Optional<Inventory> getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductProductID(productId);
    }

    public boolean isStockAvailable(Long productId, int requiredQuantity) {
        Optional<Inventory> inventory = inventoryRepository.findByProductProductID(productId);

        return inventory.isPresent()
                && inventory.get().getStockQuantity() >= requiredQuantity;
    }

    @Transactional
    public Optional<Inventory> updateStock(Long productId, int newQuantity) {
        return inventoryRepository.findByProductProductID(productId)
                .map(inventory -> {
                    inventory.setStockQuantity(newQuantity);
                    inventory.setLastUpdated(java.time.LocalDateTime.now());
                    return inventoryRepository.save(inventory);
                });
    }

    public boolean isLowStock(Long productId) {
        Optional<Inventory> inventory = inventoryRepository.findByProductProductID(productId);

        return inventory.isPresent()
                && inventory.get().getStockQuantity() <= 10;
    }

}