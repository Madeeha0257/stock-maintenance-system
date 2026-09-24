package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}