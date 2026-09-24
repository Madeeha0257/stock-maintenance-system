package com.licet.stockmaintenance.service;

import com.licet.stockmaintenance.entity.Bill;
import com.licet.stockmaintenance.entity.BillItem;
import com.licet.stockmaintenance.entity.Payment;
import com.licet.stockmaintenance.repository.BillRepository;
import com.licet.stockmaintenance.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SalesService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;

    public SalesService(
            BillRepository billRepository,
            PaymentRepository paymentRepository) {

        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
    }

    public Map<String, Object> getSalesSummary() {

        List<Bill> bills = billRepository.findAll();

        BigDecimal totalSales = bills.stream()
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = bills.size();

        BigDecimal averageBillValue = totalOrders == 0
                ? BigDecimal.ZERO
                : totalSales.divide(
                        BigDecimal.valueOf(totalOrders),
                        2,
                        RoundingMode.HALF_UP
                );

        Map<LocalDate, BigDecimal> salesByDate = bills.stream()
                .collect(Collectors.groupingBy(
                        bill -> bill.getBillDate().toLocalDate(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Bill::getTotalAmount,
                                BigDecimal::add
                        )
                ));

        List<Map<String, Object>> salesTrend = salesByDate.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("date", entry.getKey().toString());
                    data.put("sales", entry.getValue());
                    return data;
                })
                .toList();

        Map<String, Integer> productQuantities = new HashMap<>();

        for (Bill bill : bills) {
            for (BillItem item : bill.getBillItems()) {

                String productName = item.getProduct().getProductName();

                productQuantities.merge(
                        productName,
                        item.getQuantity(),
                        Integer::sum
                );
            }
        }

        List<Map<String, Object>> topSellingProducts =
                productQuantities.entrySet()
                        .stream()
                        .sorted(
                                Map.Entry.<String, Integer>comparingByValue()
                                        .reversed()
                        )
                        .limit(5)
                        .map(entry -> {
                            Map<String, Object> data = new LinkedHashMap<>();
                            data.put("productName", entry.getKey());
                            data.put("quantitySold", entry.getValue());
                            return data;
                        })
                        .toList();

        List<Payment> payments = paymentRepository.findAll();

        Map<String, BigDecimal> paymentTotals = new HashMap<>();

        for (Payment payment : payments) {

            paymentTotals.merge(
                    payment.getPaymentMethod(),
                    payment.getAmount(),
                    BigDecimal::add
            );
        }

        List<Map<String, Object>> paymentMethodBreakdown =
                paymentTotals.entrySet()
                        .stream()
                        .sorted(Map.Entry.comparingByKey())
                        .map(entry -> {
                            Map<String, Object> data = new LinkedHashMap<>();
                            data.put("paymentMethod", entry.getKey());
                            data.put("amount", entry.getValue());
                            return data;
                        })
                        .toList();

        List<Bill> recentBills = bills.stream()
                .sorted(
                        Comparator.comparing(Bill::getBillDate)
                                .reversed()
                )
                .limit(10)
                .toList();

        List<Map<String, Object>> recentSales = new ArrayList<>();

        for (Bill bill : recentBills) {

            Map<String, Object> data = new LinkedHashMap<>();

            data.put("billID", bill.getBillID());
            data.put("date", bill.getBillDate());
            data.put("totalAmount", bill.getTotalAmount());

            if (bill.getPayment() != null) {
                data.put(
                        "paymentMethod",
                        bill.getPayment().getPaymentMethod()
                );
            } else {
                data.put("paymentMethod", "N/A");
            }

            recentSales.add(data);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalSales", totalSales);
        result.put("totalOrders", totalOrders);
        result.put("averageBillValue", averageBillValue);
        result.put("salesTrend", salesTrend);
        result.put("topSellingProducts", topSellingProducts);
        result.put("paymentMethodBreakdown", paymentMethodBreakdown);
        result.put("recentSales", recentSales);

        return result;
    }
}