package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Bill;
import com.licet.stockmaintenance.entity.Customer;
import com.licet.stockmaintenance.repository.BillRepository;
import com.licet.stockmaintenance.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BillRepository billRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            BillRepository billRepository) {

        this.customerRepository = customerRepository;
        this.billRepository = billRepository;
    }

    public Customer createCustomer(Customer customer) {

        validateCustomer(customer);

        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long customerID) {

        return customerRepository.findById(customerID)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Customer not found: " + customerID
                ));
    }

    public Customer updateCustomer(
            Long customerID,
            Customer updatedCustomer) {

        Customer existingCustomer = getCustomerById(customerID);

        validateCustomer(updatedCustomer);

        existingCustomer.setCustomerName(
                updatedCustomer.getCustomerName()
        );

        existingCustomer.setPhone(
                updatedCustomer.getPhone()
        );

        return customerRepository.save(existingCustomer);
    }

    public void deleteCustomer(Long customerID) {

        Customer customer = getCustomerById(customerID);

        customerRepository.delete(customer);
    }

    public List<Bill> getPurchaseHistory(Long customerID) {

        getCustomerById(customerID);

        return billRepository.findByCustomerCustomerID(customerID);
    }

    private void validateCustomer(Customer customer) {

        if (customer == null) {
            throw new IllegalArgumentException(
                    "Customer data is required."
            );
        }

        if (customer.getCustomerName() == null
                || customer.getCustomerName().isBlank()) {

            throw new IllegalArgumentException(
                    "Customer name cannot be empty."
            );
        }

        if (customer.getPhone() == null
                || customer.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Customer phone cannot be empty."
            );
        }
    }
    
}