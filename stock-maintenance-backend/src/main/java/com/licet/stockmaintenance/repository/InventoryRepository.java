package com.licet.stockmaintenance.repository;

import com.licet.stockmaintenance.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductProductID(Long productID);
}