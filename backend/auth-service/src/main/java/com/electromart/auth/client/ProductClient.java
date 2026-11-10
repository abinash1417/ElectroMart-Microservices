package com.electromart.auth.client;

import com.electromart.auth.dto.CategoryDTO;
import com.electromart.auth.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/products")
    List<Map<String, Object>> getAllProducts();

    @PostMapping("/products")
    Map<String, Object> addProduct(@RequestBody ProductDTO productDTO);

    @PutMapping("/products/{id}")
    Map<String, Object> updateProduct(@PathVariable("id") Long id, @RequestBody ProductDTO productDTO);

    @DeleteMapping("/products/{id}")
    void deleteProduct(@PathVariable("id") Long id);

    @PostMapping("/categories")
    Map<String, Object> addCategory(@RequestBody CategoryDTO categoryDTO);

    @PutMapping("/categories/{id}")
    Map<String, Object> updateCategory(@PathVariable("id") Long id, @RequestBody CategoryDTO categoryDTO);

    @DeleteMapping("/categories/{id}")
    void deleteCategory(@PathVariable("id") Long id);

    @GetMapping("/api/reviews")
    List<Map<String, Object>> getAllReviews();

    @DeleteMapping("/api/reviews/{id}")
    void deleteReview(@PathVariable("id") Long id);
}
