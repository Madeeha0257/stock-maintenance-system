package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}