package com.electromart.cart.controller;

import com.electromart.cart.dto.CartItemDTO;
import com.electromart.cart.model.CartItem;
import com.electromart.cart.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/user/{userId}")
    public Map<String, Object> getCart(@PathVariable Long userId) {
        return cartService.getCartResponse(userId);
    }

    @PostMapping("/add")
    public CartItem addToCart(@RequestBody CartItemDTO cartItemDTO) {
        return cartService.addToCart(
                cartItemDTO.getUserId(),
                cartItemDTO.getProductId(),
                cartItemDTO.getQuantity()
        );
    }

    @DeleteMapping("/remove/{cartItemId}")
    public String removeItem(@PathVariable Long cartItemId) {
        cartService.removeCartItem(cartItemId);
        return "Item Removed";
    }

    @DeleteMapping("/clear/{cartId}")
    public String clearCart(@PathVariable Long cartId) {
        cartService.clearCart(cartId);
        return "Cart Cleared";
    }
}
