package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.repository.BillRepository;
import com.licet.stockmaintenance.repository.InventoryRepository;
import com.licet.stockmaintenance.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public DashboardService(
            BillRepository billRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository) {

        this.billRepository = billRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        BigDecimal totalSales = billRepository.findAll()
                .stream()
                .map(bill -> bill.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = billRepository.count();

        long totalProducts = productRepository.count();

        long lowStockItems = inventoryRepository.findAll()
                .stream()
                .filter(inventory -> inventory.getStockQuantity() <= 10)
                .count();

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalSales", totalSales);
        summary.put("totalOrders", totalOrders);
        summary.put("totalProducts", totalProducts);
        summary.put("lowStockItems", lowStockItems);

        return summary;
    }
}