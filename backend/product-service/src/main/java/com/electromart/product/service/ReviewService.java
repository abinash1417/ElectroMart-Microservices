package com.electromart.product.service;

import com.electromart.product.client.AuthClient;
import com.electromart.product.exception.ResourceNotFoundException;
import com.electromart.product.model.Product;
import com.electromart.product.model.Review;
import com.electromart.product.repository.ProductRepository;
import com.electromart.product.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final AuthClient authClient;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         AuthClient authClient) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.authClient = authClient;
    }

    public Review addReview(Long userId, Long productId, int rating, String comment) {
        Map<String, Object> user = authClient.getUserById(userId);
        if (user == null || user.get("name") == null) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Review review = Review.builder()
                .userId(userId)
                .userName(user.get("name").toString())
                .product(product)
                .rating(rating)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review", reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
}
