package com.ventura.hris.asset.controller;

import com.ventura.hris.asset.dto.AssetAllocationRequest;
import com.ventura.hris.asset.dto.AssetAllocationResponse;
import com.ventura.hris.asset.dto.AssetReturnRequest;
import com.ventura.hris.asset.service.AssetAllocationService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets/allocations")
public class AssetAllocationController {

    private final AssetAllocationService allocationService;

    public AssetAllocationController(AssetAllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetAllocationResponse>> allocateAsset(
            @Valid @RequestBody AssetAllocationRequest request) {
        AssetAllocationResponse response = allocationService.allocateAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Asset allocated successfully"));
    }

    @GetMapping
    public ApiResponse<List<AssetAllocationResponse>> getAllocations(
            @RequestParam(required = false) UUID assetId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(allocationService.getAllocations(assetId, employeeId, status), "Asset allocations retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<AssetAllocationResponse> getAllocationById(@PathVariable UUID id) {
        return ApiResponse.success(allocationService.getAllocationById(id), "Asset allocation retrieved successfully");
    }

    @PutMapping("/{id}/return")
    public ApiResponse<AssetAllocationResponse> returnAsset(
            @PathVariable UUID id,
            @Valid @RequestBody AssetReturnRequest request) {
        return ApiResponse.success(allocationService.returnAsset(id, request), "Asset returned successfully");
    }
}
