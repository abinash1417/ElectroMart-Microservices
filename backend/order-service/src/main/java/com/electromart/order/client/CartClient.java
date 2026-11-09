package com.electromart.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "cart-service")
public interface CartClient {

    @GetMapping("/api/cart/user/{userId}")
    Map<String, Object> getCart(@PathVariable("userId") Long userId);

    @DeleteMapping("/api/cart/clear/{cartId}")
    String clearCart(@PathVariable("cartId") Long cartId);
}
