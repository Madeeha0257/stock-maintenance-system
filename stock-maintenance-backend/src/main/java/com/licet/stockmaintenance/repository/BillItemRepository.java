package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillItemRepository extends JpaRepository<BillItem, Long> {
}