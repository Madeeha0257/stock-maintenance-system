package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {
}