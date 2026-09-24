package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Dealer;
import com.licet.stockmaintenance.repository.DealerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DealerService {

    private final DealerRepository dealerRepository;

    public DealerService(DealerRepository dealerRepository) {
        this.dealerRepository = dealerRepository;
    }

    public Dealer createDealer(Dealer dealer) {
        validateDealer(dealer);
        return dealerRepository.save(dealer);
    }

    public List<Dealer> getAllDealers() {
        return dealerRepository.findAll();
    }

    public Dealer getDealerById(Long dealerID) {
        return dealerRepository.findById(dealerID)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Dealer not found: " + dealerID
                        )
                );
    }

    public Dealer updateDealer(Long dealerID, Dealer updatedDealer) {
        Dealer existingDealer = getDealerById(dealerID);

        validateDealer(updatedDealer);

        existingDealer.setDealerName(updatedDealer.getDealerName());
        existingDealer.setPhone(updatedDealer.getPhone());
        existingDealer.setAddress(updatedDealer.getAddress());

        return dealerRepository.save(existingDealer);
    }

    public void deleteDealer(Long dealerID) {
        Dealer dealer = getDealerById(dealerID);
        dealerRepository.delete(dealer);
    }

    private void validateDealer(Dealer dealer) {

        if (dealer == null) {
            throw new IllegalArgumentException(
                    "Dealer data is required."
            );
        }

        if (dealer.getDealerName() == null ||
                dealer.getDealerName().isBlank()) {

            throw new IllegalArgumentException(
                    "Dealer name cannot be empty."
            );
        }

        if (dealer.getPhone() == null ||
                dealer.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Dealer phone cannot be empty."
            );
        }

        if (dealer.getAddress() == null ||
                dealer.getAddress().isBlank()) {

            throw new IllegalArgumentException(
                    "Dealer address cannot be empty."
            );
        }
    }
}