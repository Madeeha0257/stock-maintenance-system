package com.licet.stockmaintenance.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dealer")
public class Dealer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dealerID;

    @Column(nullable = false)
    private String dealerName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @JsonManagedReference
    @OneToMany(mappedBy = "dealer")
    private List<Product> products = new ArrayList<>();

    public Dealer() {
    }

    public Long getDealerID() {
        return dealerID;
    }

    public void setDealerID(Long dealerID) {
        this.dealerID = dealerID;
    }

    public String getDealerName() {
        return dealerName;
    }

    public void setDealerName(String dealerName) {
        this.dealerName = dealerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}