package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}