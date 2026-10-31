package com.ventura.hris.performance.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.performance.dto.PerformanceCycleRequest;
import com.ventura.hris.performance.dto.PerformanceCycleResponse;
import com.ventura.hris.performance.dto.PerformanceCycleStatusUpdateRequest;
import com.ventura.hris.performance.service.PerformanceCycleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/performance/cycles")
public class PerformanceCycleController {

    private final PerformanceCycleService cycleService;

    public PerformanceCycleController(PerformanceCycleService cycleService) {
        this.cycleService = cycleService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PerformanceCycleResponse>> createCycle(
            @Valid @RequestBody PerformanceCycleRequest request) {
        PerformanceCycleResponse response = cycleService.createCycle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Performance cycle created successfully"));
    }

    @GetMapping
    public ApiResponse<List<PerformanceCycleResponse>> getCycles(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(cycleService.getCycles(companyId, status), "Performance cycles retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PerformanceCycleResponse> getCycleById(@PathVariable UUID id) {
        return ApiResponse.success(cycleService.getCycle(id), "Performance cycle retrieved successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<PerformanceCycleResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody PerformanceCycleStatusUpdateRequest request) {
        return ApiResponse.success(cycleService.updateStatus(id, request), "Performance cycle status updated successfully");
    }
}
