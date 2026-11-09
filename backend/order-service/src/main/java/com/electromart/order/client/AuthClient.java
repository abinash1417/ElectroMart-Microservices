package com.electromart.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthClient {

    @GetMapping("/users/{id}")
    Map<String, Object> getUserById(@PathVariable("id") Long id);

    @PostMapping("/api/emails/order-cancellation")
    void sendOrderCancellation(@RequestBody Map<String, Object> emailRequest);
}
