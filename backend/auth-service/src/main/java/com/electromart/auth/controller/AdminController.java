package com.electromart.auth.controller;

import com.electromart.auth.client.OrderClient;
import com.electromart.auth.client.PaymentClient;
import com.electromart.auth.client.ProductClient;
import com.electromart.auth.dto.CategoryDTO;
import com.electromart.auth.dto.ProductDTO;
import com.electromart.auth.model.ContactMessage;
import com.electromart.auth.model.User;
import com.electromart.auth.service.ContactService;
import com.electromart.auth.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ContactService contactService;
    private final ProductClient productClient;
    private final OrderClient orderClient;
    private final PaymentClient paymentClient;

    public AdminController(UserService userService,
                           ContactService contactService,
                           ProductClient productClient,
                           OrderClient orderClient,
                           PaymentClient paymentClient) {
        this.userService = userService;
        this.contactService = contactService;
        this.productClient = productClient;
        this.orderClient = orderClient;
        this.paymentClient = paymentClient;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> orders = orderClient.getAllOrders();
        List<Map<String, Object>> payments = paymentClient.getAllPayments();
        List<Map<String, Object>> products = productClient.getAllProducts();

        double totalRevenue = payments.stream()
                .filter(p -> "SUCCESS".equals(p.get("status")))
                .mapToDouble(p -> Double.valueOf(p.get("amount").toString()))
                .sum();

        long pendingOrders = orders.stream()
                .filter(o -> "PENDING".equals(o.get("status")))
                .count();

        long paidOrders = orders.stream()
                .filter(o -> "PAID".equals(o.get("status")))
                .count();

        stats.put("totalUsers", users.size());
        stats.put("totalOrders", orders.size());
        stats.put("totalProducts", products.size());
        stats.put("totalRevenue", totalRevenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("paidOrders", paidOrders);

        return stats;
    }

    // User management
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return response;
    }

    // Product management
    @PostMapping("/products")
    public Map<String, Object> addProduct(@RequestBody ProductDTO productDTO) {
        return productClient.addProduct(productDTO);
    }

    @PutMapping("/products/{id}")
    public Map<String, Object> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        return productClient.updateProduct(id, productDTO);
    }

    @DeleteMapping("/products/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {
        productClient.deleteProduct(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Product deleted successfully");
        return response;
    }

    // Category management
    @PostMapping("/categories")
    public Map<String, Object> addCategory(@RequestBody CategoryDTO categoryDTO) {
        return productClient.addCategory(categoryDTO);
    }

    @PutMapping("/categories/{id}")
    public Map<String, Object> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        return productClient.updateCategory(id, categoryDTO);
    }

    @DeleteMapping("/categories/{id}")
    public Map<String, String> deleteCategory(@PathVariable Long id) {
        productClient.deleteCategory(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted successfully");
        return response;
    }

    // Order management
    @GetMapping("/orders")
    public List<Map<String, Object>> getAllOrders() {
        return orderClient.getAllOrders();
    }

    @GetMapping("/orders/{id}")
    public Map<String, Object> getOrderById(@PathVariable Long id) {
        return orderClient.getOrderById(id);
    }

    @GetMapping("/orders/user/{userId}")
    public List<Map<String, Object>> getOrdersByUser(@PathVariable Long userId) {
        return orderClient.getOrdersByUser(userId);
    }

    @PutMapping("/orders/{id}/status")
    public Map<String, Object> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderClient.updateOrderStatus(id, status);
    }

    // Payment management
    @GetMapping("/payments")
    public List<Map<String, Object>> getAllPayments() {
        return paymentClient.getAllPayments();
    }

    @GetMapping("/payments/{id}")
    public Map<String, Object> getPaymentById(@PathVariable Long id) {
        return paymentClient.getPaymentById(id);
    }

    @PutMapping("/payments/{id}/status")
    public Map<String, Object> updatePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        return paymentClient.updatePaymentStatus(id, status);
    }

    // Review management
    @GetMapping("/reviews")
    public List<Map<String, Object>> getAllReviews() {
        return productClient.getAllReviews();
    }

    @DeleteMapping("/reviews/{id}")
    public Map<String, String> deleteReview(@PathVariable Long id) {
        productClient.deleteReview(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review deleted successfully");
        return response;
    }

    // Contact management
    @GetMapping("/contacts")
    public List<ContactMessage> getAllContactMessages() {
        return contactService.getAllMessages();
    }

    @GetMapping("/contacts/unread")
    public List<ContactMessage> getUnreadMessages() {
        return contactService.getUnreadMessages();
    }

    @PutMapping("/contacts/{id}/read")
    public ContactMessage markAsRead(@PathVariable Long id) {
        return contactService.markAsRead(id);
    }

    @DeleteMapping("/contacts/{id}")
    public Map<String, String> deleteContactMessage(@PathVariable Long id) {
        contactService.deleteMessage(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contact message deleted successfully");
        return response;
    }
}
