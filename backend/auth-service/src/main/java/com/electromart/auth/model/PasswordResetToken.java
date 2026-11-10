package com.electromart.auth.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    private String email;

    private LocalDateTime expiryDate;

    private boolean used;
}
