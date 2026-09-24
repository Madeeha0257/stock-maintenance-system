package com.licet.stockmaintenance.controller;

import com.licet.stockmaintenance.entity.Dealer;
import com.licet.stockmaintenance.service.DealerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dealers")
public class DealerController {

    private final DealerService dealerService;

    public DealerController(DealerService dealerService) {
        this.dealerService = dealerService;
    }

    @PostMapping
    public ResponseEntity<?> createDealer(@RequestBody Dealer dealer) {
        try {
            Dealer savedDealer = dealerService.createDealer(dealer);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedDealer);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Dealer>> getAllDealers() {
        return ResponseEntity.ok(dealerService.getAllDealers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDealerById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    dealerService.getDealerById(id)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDealer(
            @PathVariable Long id,
            @RequestBody Dealer dealer) {

        try {
            return ResponseEntity.ok(
                    dealerService.updateDealer(id, dealer)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDealer(@PathVariable Long id) {
        try {
            dealerService.deleteDealer(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}