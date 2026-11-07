package com.electromart.cart.service;

import com.electromart.cart.client.ProductClient;
import com.electromart.cart.exception.ResourceNotFoundException;
import com.electromart.cart.model.Cart;
import com.electromart.cart.model.CartItem;
import com.electromart.cart.repository.CartItemRepository;
import com.electromart.cart.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductClient productClient;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductClient productClient) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productClient = productClient;
    }

    public Cart getCartByUser(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = Cart.builder().userId(userId).build();
                    return cartRepository.save(cart);
                });
    }

    public Map<String, Object> getCartResponse(Long userId) {
        Cart cart = getCartByUser(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", cart.getId());
        response.put("userId", cart.getUserId());

        List<Map<String, Object>> itemsList = new ArrayList<>();
        if (cart.getCartItems() != null) {
            for (CartItem item : cart.getCartItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("productId", item.getProductId());
                itemMap.put("quantity", item.getQuantity());
                
                // Fetch product details
                try {
                    Map<String, Object> product = productClient.getProductById(item.getProductId());
                    itemMap.put("product", product);
                } catch (Exception e) {
                    itemMap.put("product", null);
                }
                itemsList.add(itemMap);
            }
        }
        response.put("cartItems", itemsList);
        return response;
    }

    public CartItem addToCart(Long userId, Long productId, int quantity) {
        Cart cart = getCartByUser(userId);

        // Verify if product exists
        productClient.getProductById(productId);

        // Check if item already exists in cart, if so, update quantity
        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return cartItemRepository.save(existingItem);
        }

        CartItem cartItem = CartItem.builder()
                .cart(cart)
                .productId(productId)
                .quantity(quantity)
                .build();

        return cartItemRepository.save(cartItem);
    }

    public void removeCartItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new ResourceNotFoundException("CartItem", cartItemId);
        }
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", cartId));
        if (cart.getCartItems() != null) {
            cart.getCartItems().clear();
        }
        cartRepository.save(cart);
    }
}
