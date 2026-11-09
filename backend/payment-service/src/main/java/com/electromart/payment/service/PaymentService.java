package com.electromart.payment.service;

import com.electromart.payment.client.AuthClient;
import com.electromart.payment.client.OrderClient;
import com.electromart.payment.exception.ResourceNotFoundException;
import com.electromart.payment.model.Payment;
import com.electromart.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final AuthClient authClient;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderClient orderClient,
                          AuthClient authClient) {
        this.paymentRepository = paymentRepository;
        this.orderClient = orderClient;
        this.authClient = authClient;
    }

    @Transactional
    public Payment makePayment(Long orderId, String cardNumber, String paymentMethod, String cardHolderName, String expiryDate, double amount) {
        // 1. Verify Order exists
        Map<String, Object> order = orderClient.getOrderById(orderId);
        if (order == null || order.get("id") == null) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        // 2. Create Payment Record
        Payment payment = Payment.builder()
                .orderId(orderId)
                .cardNumber(cardNumber)
                .paymentMethod(paymentMethod)
                .cardHolderName(cardHolderName)
                .expiryDate(expiryDate)
                .amount(amount)
                .paymentDate(LocalDateTime.now())
                .status("SUCCESS")
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 3. Mark Order as PAID
        orderClient.updateOrderStatus(orderId, "PAID");

        // 4. Retrieve User Details for Notification
        try {
            Long userId = Long.valueOf(order.get("userId").toString());
            Map<String, Object> user = authClient.getUserById(userId);

            if (user != null && user.get("email") != null) {
                Map<String, Object> emailRequest = new HashMap<>();
                emailRequest.put("email", user.get("email").toString());
                emailRequest.put("customerName", user.get("name").toString());
                emailRequest.put("orderId", orderId);
                emailRequest.put("totalAmount", amount);

                authClient.sendOrderConfirmation(emailRequest);
            }
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return savedPayment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
    }

    public Payment updatePaymentStatus(Long paymentId, String status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }
}
