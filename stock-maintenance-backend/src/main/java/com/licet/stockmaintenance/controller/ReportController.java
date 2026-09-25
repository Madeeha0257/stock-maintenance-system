package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/stock")
    public Map<String, Object> getStockReport() {
        return reportService.getStockReport();
    }

    @GetMapping("/sales")
    public Map<String, Object> getSalesReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return reportService.getSalesReport(startDate, endDate);
    }

    @GetMapping("/dealers")
    public List<Map<String, Object>> getDealerReports() {
        return reportService.getDealerReports();
    }

    @GetMapping("/customers/{customerID}")
    public Map<String, Object> getCustomerReport(
            @PathVariable Long customerID) {

        return reportService.getCustomerReport(customerID);
    }

    @GetMapping("/inventory-valuation")
    public Map<String, Object> getInventoryValuation() {
        return reportService.getInventoryValuation();
    }

    @GetMapping("/profit")
    public Map<String, Object> getProfitReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return reportService.getProfitReport(startDate, endDate);
    }
}