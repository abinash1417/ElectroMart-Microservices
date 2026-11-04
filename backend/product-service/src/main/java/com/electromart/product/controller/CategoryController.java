package com.electromart.product.controller;

import com.electromart.product.dto.CategoryDTO;
import com.electromart.product.model.Category;
import com.electromart.product.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Standard API Endpoints
    @GetMapping({"/categories", "/api/categories/all"})
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping({"/categories", "/api/categories/add"})
    public Category addCategory(@RequestBody CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        return categoryService.saveCategory(category);
    }

    @GetMapping({"/categories/{id}", "/api/categories/{id}"})
    public Category getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @PutMapping("/categories/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        return categoryService.updateCategory(id, categoryDTO);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
