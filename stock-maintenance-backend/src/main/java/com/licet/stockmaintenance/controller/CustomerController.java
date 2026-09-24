package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.entity.Customer;
import com.licet.stockmaintenance.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<?> createCustomer(
            @RequestBody Customer customer) {

        try {
            Customer savedCustomer =
                    customerService.createCustomer(customer);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedCustomer);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    customerService.getCustomerById(id)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer customer) {

        try {
            return ResponseEntity.ok(
                    customerService.updateCustomer(id, customer)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(
            @PathVariable Long id) {

        try {
            customerService.deleteCustomer(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/purchase-history")
    public ResponseEntity<?> getPurchaseHistory(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    customerService.getPurchaseHistory(id)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}