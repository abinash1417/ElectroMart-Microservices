package com.electromart.cart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemDTO {
    private Long userId;
    private Long productId;
    private Integer quantity;
}
