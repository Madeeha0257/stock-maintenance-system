package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.service.SalesService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

    private final SalesService salesService;

    public SalesController(SalesService salesService) {
        this.salesService = salesService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSalesSummary() {
        return salesService.getSalesSummary();
    }
}