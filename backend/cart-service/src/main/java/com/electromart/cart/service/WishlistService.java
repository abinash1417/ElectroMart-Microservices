package com.electromart.cart.service;

import com.electromart.cart.client.ProductClient;
import com.electromart.cart.model.Wishlist;
import com.electromart.cart.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductClient productClient;

    public WishlistService(WishlistRepository wishlistRepository,
                           ProductClient productClient) {
        this.wishlistRepository = wishlistRepository;
        this.productClient = productClient;
    }

    public List<Map<String, Object>> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(w -> {
                    try {
                        return productClient.getProductById(w.getProductId());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    public void addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) return;

        // Verify product exists
        productClient.getProductById(productId);

        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .productId(productId)
                .build();

        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void toggleWishlist(Long userId, Long productId) {
        if (userId == null || productId == null) {
            throw new RuntimeException("userId and productId must not be null");
        }
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            addToWishlist(userId, productId);
        }
    }
}
