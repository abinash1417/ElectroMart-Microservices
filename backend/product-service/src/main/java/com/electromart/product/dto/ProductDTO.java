package com.electromart.product.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDTO {
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String frontImage;
    private Long categoryId;
}
