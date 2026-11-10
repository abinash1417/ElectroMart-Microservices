package com.electromart.auth.controller;

import com.electromart.auth.dto.ContactMessageDTO;
import com.electromart.auth.model.ContactMessage;
import com.electromart.auth.service.ContactService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/send")
    public ContactMessage sendMessage(@RequestBody ContactMessageDTO dto) {
        return contactService.saveMessage(
                dto.getName(),
                dto.getEmail(),
                dto.getSubject(),
                dto.getMessage()
        );
    }
}
