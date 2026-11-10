package com.electromart.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/api/orders")
    List<Map<String, Object>> getAllOrders();

    @GetMapping("/api/orders/{id}")
    Map<String, Object> getOrderById(@PathVariable("id") Long id);

    @GetMapping("/api/orders/user/{userId}")
    List<Map<String, Object>> getOrdersByUser(@PathVariable("userId") Long userId);

    @PutMapping("/api/orders/{id}/status")
    Map<String, Object> updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}
