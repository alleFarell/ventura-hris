package com.ventura.hris.asset.controller;

import com.ventura.hris.asset.dto.AssetCategoryRequest;
import com.ventura.hris.asset.dto.AssetCategoryResponse;
import com.ventura.hris.asset.service.AssetCategoryService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets/categories")
public class AssetCategoryController {

    private final AssetCategoryService categoryService;

    public AssetCategoryController(AssetCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetCategoryResponse>> createCategory(
            @Valid @RequestBody AssetCategoryRequest request) {
        AssetCategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Asset category created successfully"));
    }

    @GetMapping
    public ApiResponse<List<AssetCategoryResponse>> getCategories(
            @RequestParam(required = false) UUID companyId) {
        return ApiResponse.success(categoryService.getCategories(companyId), "Asset categories retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<AssetCategoryResponse> getCategoryById(@PathVariable UUID id) {
        return ApiResponse.success(categoryService.getCategoryById(id), "Asset category retrieved successfully");
    }
}
