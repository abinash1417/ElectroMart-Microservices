package com.electromart.order.controller;

import com.electromart.order.client.ProductClient;
import com.electromart.order.dto.OrderDTO;
import com.electromart.order.model.Order;
import com.electromart.order.model.OrderItem;
import com.electromart.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final ProductClient productClient;

    public OrderController(OrderService orderService, ProductClient productClient) {
        this.orderService = orderService;
        this.productClient = productClient;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderDTO orderDTO) {
        Order order = orderService.createOrderFromCart(orderDTO.getUserId());
        return ResponseEntity.ok(enrichOrder(order));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);
        List<Map<String, Object>> enriched = orders.stream()
                .map(this::enrichOrder)
                .collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(enrichOrder(order));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<Map<String, Object>> enriched = orders.stream()
                .map(this::enrichOrder)
                .collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String reason = body.getOrDefault("reason", "No reason provided").toString();
        Order cancelled = orderService.cancelOrder(orderId, userId, reason);
        return ResponseEntity.ok(enrichOrder(cancelled));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(enrichOrder(order));
    }

    private Map<String, Object> enrichOrder(Order order) {
        Map<String, Object> orderMap = new HashMap<>();
        orderMap.put("id", order.getId());
        orderMap.put("userId", order.getUserId());
        orderMap.put("orderDate", order.getOrderDate());
        orderMap.put("totalAmount", order.getTotalAmount());
        orderMap.put("status", order.getStatus());
        orderMap.put("cancellationReason", order.getCancellationReason());
        orderMap.put("cancellationDate", order.getCancellationDate());

        List<Map<String, Object>> itemsList = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("productId", item.getProductId());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getPrice());

                try {
                    Map<String, Object> product = productClient.getProductById(item.getProductId());
                    itemMap.put("product", product);
                } catch (Exception e) {
                    itemMap.put("product", null);
                }
                itemsList.add(itemMap);
            }
        }
        orderMap.put("orderItems", itemsList);
        return orderMap;
    }
}
