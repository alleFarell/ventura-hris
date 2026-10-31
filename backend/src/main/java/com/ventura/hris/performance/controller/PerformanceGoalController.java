package com.ventura.hris.performance.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.performance.dto.KeyResultProgressUpdateRequest;
import com.ventura.hris.performance.dto.PerformanceGoalRequest;
import com.ventura.hris.performance.dto.PerformanceGoalResponse;
import com.ventura.hris.performance.service.PerformanceGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/performance/goals")
public class PerformanceGoalController {

    private final PerformanceGoalService goalService;

    public PerformanceGoalController(PerformanceGoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PerformanceGoalResponse>> createGoal(
            @Valid @RequestBody PerformanceGoalRequest request) {
        PerformanceGoalResponse response = goalService.createGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Performance goal created successfully"));
    }

    @GetMapping
    public ApiResponse<List<PerformanceGoalResponse>> getGoals(
            @RequestParam(required = false) UUID cycleId,
            @RequestParam(required = false) UUID employeeId) {
        return ApiResponse.success(goalService.getGoals(cycleId, employeeId), "Performance goals retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PerformanceGoalResponse> getGoalById(@PathVariable UUID id) {
        return ApiResponse.success(goalService.getGoal(id), "Performance goal retrieved successfully");
    }

    @PutMapping("/{id}/key-results/{krId}/progress")
    public ApiResponse<PerformanceGoalResponse> updateKeyResultProgress(
            @PathVariable UUID id,
            @PathVariable UUID krId,
            @Valid @RequestBody KeyResultProgressUpdateRequest request) {
        return ApiResponse.success(goalService.updateKeyResultProgress(id, krId, request), "Key result progress updated successfully");
    }
}
