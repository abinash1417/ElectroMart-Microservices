package com.electromart.auth.dto;

import lombok.Getter;
import java.util.List;

@Getter
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private List<String> roles;

    public AuthResponse(String token, Long id, String name,
                        String email, List<String> roles) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
    }
}
