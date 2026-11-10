package com.electromart.auth.service;

import com.electromart.auth.model.ContactMessage;
import com.electromart.auth.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    public ContactService(ContactMessageRepository contactMessageRepository,
                          EmailService emailService) {
        this.contactMessageRepository = contactMessageRepository;
        this.emailService = emailService;
    }

    public ContactMessage saveMessage(String name, String email,
                                      String subject, String message) {
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setName(name);
        contactMessage.setEmail(email);
        contactMessage.setSubject(subject);
        contactMessage.setMessage(message);
        contactMessage.setSentAt(LocalDateTime.now());
        contactMessage.setIsRead(false);

        ContactMessage saved = contactMessageRepository.save(contactMessage);

        // Send auto-reply email
        emailService.sendContactAutoReply(email, name, subject);

        return saved;
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAll();
    }

    public List<ContactMessage> getUnreadMessages() {
        return contactMessageRepository.findByIsReadFalse();
    }

    public ContactMessage markAsRead(Long id) {
        ContactMessage msg = contactMessageRepository.findById(id).orElse(null);
        if (msg != null) {
            msg.setIsRead(true);
            return contactMessageRepository.save(msg);
        }
        return null;
    }

    public void deleteMessage(Long id) {
        contactMessageRepository.deleteById(id);
    }
}
