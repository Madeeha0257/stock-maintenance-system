package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByCustomerCustomerID(Long customerID);
}