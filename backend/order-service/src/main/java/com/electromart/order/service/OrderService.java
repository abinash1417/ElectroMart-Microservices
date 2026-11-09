package com.electromart.order.service;

import com.electromart.order.client.AuthClient;
import com.electromart.order.client.CartClient;
import com.electromart.order.client.ProductClient;
import com.electromart.order.exception.BadRequestException;
import com.electromart.order.exception.ResourceNotFoundException;
import com.electromart.order.model.Order;
import com.electromart.order.model.OrderItem;
import com.electromart.order.repository.OrderItemRepository;
import com.electromart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final AuthClient authClient;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartClient cartClient,
                        ProductClient productClient,
                        AuthClient authClient) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartClient = cartClient;
        this.productClient = productClient;
        this.authClient = authClient;
    }

    @Transactional
    public Order createOrderFromCart(Long userId) {
        // 1. Verify User
        Map<String, Object> user = authClient.getUserById(userId);
        if (user == null || user.get("id") == null) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        // 2. Fetch Cart
        Map<String, Object> cart = cartClient.getCart(userId);
        if (cart == null || cart.get("cartItems") == null) {
            throw new BadRequestException("Cart is empty");
        }

        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) cart.get("cartItems");
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // 3. Create Order
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");

        double total = 0;
        Set<OrderItem> orderItems = new HashSet<>();

        for (Map<String, Object> item : cartItems) {
            Long productId = Long.valueOf(item.get("productId").toString());
            Integer quantity = Integer.valueOf(item.get("quantity").toString());

            // Get product from product-service
            Map<String, Object> product = productClient.getProductById(productId);
            if (product == null) {
                throw new ResourceNotFoundException("Product", productId);
            }

            Double price = Double.valueOf(product.get("price").toString());
            Integer stock = Integer.valueOf(product.get("stock").toString());

            if (stock < quantity) {
                throw new BadRequestException("Insufficient stock for product: " + product.get("name"));
            }

            // Decrement Stock
            productClient.updateStock(productId, quantity);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(productId)
                    .quantity(quantity)
                    .price(price)
                    .build();

            total += price * quantity;
            orderItems.add(orderItem);
        }

        order.setTotalAmount(total);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        // 4. Clear Cart
        Long cartId = Long.valueOf(cart.get("id").toString());
        cartClient.clearCart(cartId);

        return savedOrder;
    }

    @Transactional
    public Order cancelOrder(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUserId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this order");
        }

        if (!canBeCancelled(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled at this stage: " + order.getStatus());
        }

        order.setStatus("CANCELLED");
        order.setCancellationReason(reason);
        order.setCancellationDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Send Email via Auth Service
        try {
            Map<String, Object> user = authClient.getUserById(userId);
            if (user != null && user.get("email") != null) {
                Map<String, Object> emailRequest = new HashMap<>();
                emailRequest.put("email", user.get("email").toString());
                emailRequest.put("customerName", user.get("name").toString());
                emailRequest.put("orderId", orderId);
                emailRequest.put("totalAmount", order.getTotalAmount());
                emailRequest.put("reason", reason);

                authClient.sendOrderCancellation(emailRequest);
            }
        } catch (Exception e) {
            System.err.println("Failed to send cancellation notification: " + e.getMessage());
        }

        return savedOrder;
    }

    private boolean canBeCancelled(String status) {
        return "PAID".equals(status) || "PROCESSING".equals(status) || "PENDING".equals(status);
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
