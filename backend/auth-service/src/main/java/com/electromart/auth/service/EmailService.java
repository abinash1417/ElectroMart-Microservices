package com.electromart.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmationEmail(String to, String customerName, Long orderId, Double totalAmount) {
        String deliveryCode = String.format("%06d", (orderId * 7919) % 1000000);

        String subject = "ElectroMart — Order #" + orderId + " Confirmed!";
        String html = """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background-color:#0d1117;font-family:Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:16px;border:1px solid #30363d;overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 40px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">⚡ ElectroMart</h1>
                    <p style="color:#fca5a5;margin:8px 0 0;font-size:15px;">Order Confirmed!</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="color:#e6edf3;font-size:16px;margin:0 0 8px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#8b949e;font-size:14px;margin:0 0 28px;line-height:1.6;">
                      Thank you for your order! Your payment was successful and your order is being processed.
                    </p>
                    <!-- Order Info -->
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:10px;padding:20px;margin:0 0 28px;">
                      <tr>
                        <td style="color:#6e7681;font-size:13px;padding:4px 0;">Order ID</td>
                        <td style="color:#e6edf3;font-size:13px;font-weight:600;text-align:right;">#%d</td>
                      </tr>
                      <tr>
                        <td style="color:#6e7681;font-size:13px;padding:4px 0;">Total Amount</td>
                        <td style="color:#dc2626;font-size:13px;font-weight:700;text-align:right;">LKR %s</td>
                      </tr>
                      <tr>
                        <td style="color:#6e7681;font-size:13px;padding:4px 0;">Status</td>
                        <td style="color:#4ade80;font-size:13px;font-weight:600;text-align:right;">✓ Paid</td>
                      </tr>
                    </table>
                    <!-- Delivery Code Box -->
                    <div style="background:#0d1117;border:2px dashed #dc2626;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                      <p style="color:#6e7681;font-size:11px;margin:0 0 10px;letter-spacing:3px;text-transform:uppercase;">📦 Delivery Confirmation Code</p>
                      <p style="color:#dc2626;font-size:52px;font-weight:900;margin:0;letter-spacing:14px;font-family:monospace;">%s</p>
                      <p style="color:#6e7681;font-size:12px;margin:12px 0 0;line-height:1.6;">
                        Show this code to the delivery person when your order arrives.<br>
                        <strong style="color:#8b949e;">Do not share this code until you receive your order.</strong>
                      </p>
                    </div>
                    <p style="color:#6e7681;font-size:13px;margin:0;line-height:1.6;">
                      If you have any questions about your order, please contact our support team.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
                    <p style="color:#484f58;font-size:12px;margin:0;">© 2026 ElectroMart · Thank you for shopping with us!</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(
                customerName,
                orderId,
                String.format("%,.2f", totalAmount),
                deliveryCode
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    public void sendContactAutoReply(String toEmail, String customerName, String subject) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("✅ We received your message - ElectroMart");
            helper.setText(buildContactAutoReplyTemplate(customerName, subject), true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send auto-reply: " + e.getMessage());
        }
    }

    private String buildContactAutoReplyTemplate(String customerName, String subject) {
        String template = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); padding: 40px; text-align:center;">
                                        <h1 style="color:#e94560; margin:0; font-size:32px; letter-spacing:2px;">&#9889; ElectroMart</h1>
                                        <p style="color:#a0aec0; margin:8px 0 0 0; font-size:14px;">Customer Support</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px; text-align:center; background-color:#f8f9ff;">
                                        <h2 style="color:#2d3748; margin:20px 0 8px 0; font-size:26px;">&#128232; Message Received!</h2>
                                        <p style="color:#718096; margin:0; font-size:16px;">We will get back to you shortly</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 40px;">
                                        <p style="color:#2d3748; font-size:16px; margin:0;">
                                            Hello <strong>CUSTOMER_NAME</strong>, &#128075;
                                        </p>
                                        <p style="color:#718096; font-size:15px; line-height:1.6; margin:10px 0 0 0;">
                                            Thank you for reaching out to ElectroMart! We have successfully received your message regarding:
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px 40px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7fafc; border-radius:10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding:20px 25px; border-bottom:1px solid #e2e8f0;">
                                                    <p style="margin:0; color:#718096; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Subject</p>
                                                    <p style="margin:5px 0 0 0; color:#2d3748; font-size:18px; font-weight:bold;">SUBJECT</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:20px 25px;">
                                                    <p style="margin:0; color:#718096; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Expected Response Time</p>
                                                    <p style="margin:5px 0 0 0; color:#2d3748; font-size:16px;">Within 24 hours &#128336;</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px 40px; text-align:center;">
                                        <p style="color:#718096; font-size:14px; line-height:1.6; margin:0;">
                                            Our support team will review your message and respond as soon as possible.<br>
                                            We appreciate your patience! &#128522;
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding:30px 40px; text-align:center;">
                                        <p style="color:#a0aec0; margin:0; font-size:13px;">&#169; 2026 ElectroMart. All rights reserved.</p>
                                        <p style="color:#718096; margin:8px 0 0 0; font-size:12px;">This is an automated email, please do not reply.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;

        return template
                .replace("CUSTOMER_NAME", customerName)
                .replace("SUBJECT", subject);
    }

    public void sendCancellationEmail(String toEmail, String customerName, Long orderId, Double totalAmount, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Order #" + orderId + " Cancelled - Refund Processing | ElectroMart");
            helper.setText(buildCancellationEmailHtml(customerName, orderId, totalAmount, reason), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send cancellation email: " + e.getMessage());
        }
    }

    private String buildCancellationEmailHtml(String customerName, Long orderId, Double totalAmount, String reason) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#0d1117;font-family:Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:16px;border:1px solid #30363d;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:30px 40px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:24px;">⚡ ElectroMart</h1>
                    <p style="color:#fca5a5;margin:6px 0 0;font-size:14px;">Order Cancellation</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="color:#e6edf3;font-size:16px;margin:0 0 16px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#8b949e;font-size:14px;margin:0 0 24px;line-height:1.6;">
                      Your order has been successfully cancelled. Here are the details:
                    </p>
                    <table width="100%%" style="background:#0d1117;border-radius:10px;padding:20px;margin:0 0 24px;">
                      <tr>
                        <td style="color:#6e7681;font-size:13px;padding:4px 0;">Order ID</td>
                        <td style="color:#e6edf3;font-size:13px;font-weight:bold;text-align:right;">#%d</td>
                      </tr>
                      <tr>
                        <td style="color:#6e7681;font-size:13px;padding:4px 0;">Refund Amount</td>
                        <td style="color:#4ade80;font-size:13px;font-weight:bold;text-align:right;">LKR %s</td>
                      </tr>
                      <tr>
                        <td style="color:#6e7681;font-size:13px;padding:4px 0;">Reason</td>
                        <td style="color:#e6edf3;font-size:13px;text-align:right;">%s</td>
                      </tr>
                    </table>
                    <div style="background:#0d1117;border:1px solid #238636;border-radius:10px;padding:20px;margin:0 0 20px;">
                      <p style="color:#4ade80;font-size:14px;margin:0 0 8px;font-weight:bold;">💚 Refund Information</p>
                      <p style="color:#8b949e;font-size:13px;margin:0;line-height:1.6;">
                        Your refund of <strong style="color:#4ade80;">LKR %s</strong> will be processed
                        within <strong style="color:#e6edf3;">3-5 business days</strong> to your original payment method.
                      </p>
                    </div>
                    <p style="color:#6e7681;font-size:13px;margin:0;">
                      If you have any questions, please contact our support team.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
                    <p style="color:#484f58;font-size:12px;margin:0;">© 2026 ElectroMart</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(customerName, orderId,
                String.format("%,.2f", totalAmount),
                reason,
                String.format("%,.2f", totalAmount));
    }
}
