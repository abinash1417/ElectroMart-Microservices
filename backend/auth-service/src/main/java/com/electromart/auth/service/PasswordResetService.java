package com.electromart.auth.service;

import com.electromart.auth.model.PasswordResetToken;
import com.electromart.auth.model.User;
import com.electromart.auth.repository.PasswordResetTokenRepository;
import com.electromart.auth.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                JavaMailSender mailSender,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void sendResetEmail(String email) {
        boolean userExists = userRepository.findByEmail(email).isPresent();
        if (!userExists) return;

        tokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(email)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        sendResetEmailHtml(email, resetLink);
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);

        if (resetToken == null) return false;
        if (resetToken.isUsed()) return false;
        if (LocalDateTime.now().isAfter(resetToken.getExpiryDate())) return false;

        User user = userRepository.findByEmail(resetToken.getEmail()).orElse(null);
        if (user == null) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return true;
    }

    public boolean validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);
        if (resetToken == null || resetToken.isUsed()) return false;
        return LocalDateTime.now().isBefore(resetToken.getExpiryDate());
    }

    private void sendResetEmailHtml(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("chandrannash281418@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("ElectroMart — Reset Your Password");
            helper.setText(buildResetEmailHtml(resetLink), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send reset email: " + e.getMessage());
        }
    }

    private String buildResetEmailHtml(String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background-color:#0d1117;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:16px;border:1px solid #30363d;overflow:hidden;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px 40px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">⚡ ElectroMart</h1>
                        <p style="color:#fca5a5;margin:6px 0 0;font-size:14px;">Password Reset Request</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px;">
                        <p style="color:#8b949e;font-size:15px;margin:0 0 24px;line-height:1.6;">
                          We received a request to reset your ElectroMart password.<br>
                          Click the button below to set a new password.
                        </p>
                        <div style="text-align:center;margin:0 0 28px;">
                          <a href="%s" style="display:inline-block;background:#dc2626;color:#fff;font-size:16px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                            Reset My Password
                          </a>
                        </div>
                        <p style="color:#6e7681;font-size:13px;margin:0 0 8px;line-height:1.6;">
                          This link will expire in <strong style="color:#8b949e;">15 minutes</strong>.
                        </p>
                        <p style="color:#6e7681;font-size:13px;margin:0;line-height:1.6;">
                          If you did not request a password reset, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
                        <p style="color:#484f58;font-size:12px;margin:0;">© 2026 ElectroMart · Secure Account Management</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(resetLink);
    }
}
