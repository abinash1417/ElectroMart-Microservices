package com.electromart.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/api/orders/{id}")
    Map<String, Object> getOrderById(@PathVariable("id") Long id);

    @PutMapping("/api/orders/{id}/status")
    Map<String, Object> updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}
