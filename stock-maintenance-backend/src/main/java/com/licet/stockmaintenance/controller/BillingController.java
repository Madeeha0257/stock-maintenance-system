package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.entity.Bill;
import com.licet.stockmaintenance.service.BillingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    public ResponseEntity<?> createBill(@RequestBody BillRequest request) {

        try {
            Bill bill = billingService.createBill(
                    request.getItems(),
                    request.getPaymentMethod()
            );

            return ResponseEntity.ok(bill);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    public static class BillRequest {

        private List<BillingService.BillRequestItem> items;
        private String paymentMethod;

        public BillRequest() {
        }

        public List<BillingService.BillRequestItem> getItems() {
            return items;
        }

        public void setItems(List<BillingService.BillRequestItem> items) {
            this.items = items;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }
}