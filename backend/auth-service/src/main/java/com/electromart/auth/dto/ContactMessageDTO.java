package com.electromart.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactMessageDTO {
    private String name;
    private String email;
    private String subject;
    private String message;
}
