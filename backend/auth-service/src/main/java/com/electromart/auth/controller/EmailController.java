package com.electromart.auth.controller;

import com.electromart.auth.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/order-confirmation")
    public ResponseEntity<Void> sendOrderConfirmation(@RequestBody Map<String, Object> body) {
        String email = body.get("email").toString();
        String customerName = body.get("customerName").toString();
        Long orderId = Long.valueOf(body.get("orderId").toString());
        Double totalAmount = Double.valueOf(body.get("totalAmount").toString());

        emailService.sendOrderConfirmationEmail(email, customerName, orderId, totalAmount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/order-cancellation")
    public ResponseEntity<Void> sendOrderCancellation(@RequestBody Map<String, Object> body) {
        String email = body.get("email").toString();
        String customerName = body.get("customerName").toString();
        Long orderId = Long.valueOf(body.get("orderId").toString());
        Double totalAmount = Double.valueOf(body.get("totalAmount").toString());
        String reason = body.getOrDefault("reason", "").toString();

        emailService.sendCancellationEmail(email, customerName, orderId, totalAmount, reason);
        return ResponseEntity.ok().build();
    }
}
