package com.electromart.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @GetMapping("/api/payments")
    List<Map<String, Object>> getAllPayments();

    @GetMapping("/api/payments/{id}")
    Map<String, Object> getPaymentById(@PathVariable("id") Long id);

    @PutMapping("/api/payments/{id}/status")
    Map<String, Object> updatePaymentStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}
