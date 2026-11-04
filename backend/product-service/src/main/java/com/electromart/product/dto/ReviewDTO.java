package com.electromart.product.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewDTO {
    private Long userId;
    private Long productId;
    private Integer rating;
    private String comment;
}
