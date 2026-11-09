package com.electromart.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthClient {

    @GetMapping("/users/{id}")
    Map<String, Object> getUserById(@PathVariable("id") Long id);

    @PostMapping("/api/emails/order-confirmation")
    void sendOrderConfirmation(@RequestBody Map<String, Object> emailRequest);
}
