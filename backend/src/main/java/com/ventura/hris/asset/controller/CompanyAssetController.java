package com.ventura.hris.asset.controller;

import com.ventura.hris.asset.dto.CompanyAssetRequest;
import com.ventura.hris.asset.dto.CompanyAssetResponse;
import com.ventura.hris.asset.service.CompanyAssetService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
public class CompanyAssetController {

    private final CompanyAssetService assetService;

    public CompanyAssetController(CompanyAssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyAssetResponse>> createAsset(
            @Valid @RequestBody CompanyAssetRequest request) {
        CompanyAssetResponse response = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Asset created successfully"));
    }

    @GetMapping
    public ApiResponse<List<CompanyAssetResponse>> getAssets(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(assetService.getAssets(companyId, categoryId, status), "Assets retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<CompanyAssetResponse> getAssetById(@PathVariable UUID id) {
        return ApiResponse.success(assetService.getAssetById(id), "Asset retrieved successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<CompanyAssetResponse> updateAssetStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String conditionGrade) {
        return ApiResponse.success(assetService.updateStatus(id, status, conditionGrade), "Asset status updated successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<CompanyAssetResponse> updateAsset(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyAssetRequest request) {
        return ApiResponse.success(assetService.updateAsset(id, request), "Asset updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
        return ApiResponse.success(null, "Asset deleted successfully");
    }
}
