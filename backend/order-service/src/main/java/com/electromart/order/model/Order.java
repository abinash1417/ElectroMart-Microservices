package com.electromart.order.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDateTime orderDate;
    private Double totalAmount;

    // Status values: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUND_PENDING, REFUNDED
    private String status;

    private String cancellationReason;
    private LocalDateTime cancellationDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private Set<OrderItem> orderItems;
}
