package com.electromart.payment.controller;

import com.electromart.payment.dto.PaymentDTO;
import com.electromart.payment.model.Payment;
import com.electromart.payment.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/make")
    public Payment makePayment(@RequestBody PaymentDTO paymentDTO) {
        return paymentService.makePayment(
                paymentDTO.getOrderId(),
                paymentDTO.getCardNumber(),
                paymentDTO.getPaymentMethod(),
                paymentDTO.getCardHolderName(),
                paymentDTO.getExpiryDate(),
                paymentDTO.getAmount()
        );
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @PutMapping("/{id}/status")
    public Payment updatePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        return paymentService.updatePaymentStatus(id, status);
    }
}
