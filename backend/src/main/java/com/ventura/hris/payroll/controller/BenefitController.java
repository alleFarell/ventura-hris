package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.service.BenefitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/benefits")
public class BenefitController {

    private final BenefitService benefitService;

    public BenefitController(BenefitService benefitService) {
        this.benefitService = benefitService;
    }

    // Benefit Plans
    @GetMapping("/plans")
    public ApiResponse<List<BenefitPlanResponse>> getAllPlans(@RequestParam(required = false) Boolean activeOnly) {
        return ApiResponse.success(benefitService.getAllPlans(activeOnly), "Benefit plans retrieved successfully");
    }

    @GetMapping("/plans/{id}")
    public ApiResponse<BenefitPlanResponse> getPlanById(@PathVariable UUID id) {
        return ApiResponse.success(benefitService.getPlan(id), "Benefit plan retrieved successfully");
    }

    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<BenefitPlanResponse>> createPlan(@Valid @RequestBody BenefitPlanRequest request) {
        BenefitPlanResponse response = benefitService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Benefit plan created successfully"));
    }

    @PutMapping("/plans/{id}")
    public ApiResponse<BenefitPlanResponse> updatePlan(
            @PathVariable UUID id,
            @Valid @RequestBody BenefitPlanRequest request) {
        return ApiResponse.success(benefitService.updatePlan(id, request), "Benefit plan updated successfully");
    }

    // Benefit Claims
    @GetMapping("/claims")
    public ApiResponse<List<EmployeeBenefitClaimResponse>> getClaims(@RequestParam(required = false) UUID employeeId) {
        return ApiResponse.success(benefitService.getClaims(employeeId), "Benefit claims retrieved successfully");
    }

    @GetMapping("/claims/{id}")
    public ApiResponse<EmployeeBenefitClaimResponse> getClaimById(@PathVariable UUID id) {
        return ApiResponse.success(benefitService.getClaim(id), "Benefit claim retrieved successfully");
    }

    @PostMapping("/claims")
    public ResponseEntity<ApiResponse<EmployeeBenefitClaimResponse>> submitClaim(@Valid @RequestBody EmployeeBenefitClaimRequest request) {
        EmployeeBenefitClaimResponse response = benefitService.submitClaim(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Benefit claim submitted successfully"));
    }

    @PutMapping("/claims/{id}/status")
    public ApiResponse<EmployeeBenefitClaimResponse> updateClaimStatus(
            @PathVariable UUID id,
            @Valid @RequestBody BenefitClaimStatusUpdateRequest request) {
        return ApiResponse.success(benefitService.updateClaimStatus(id, request), "Benefit claim status updated successfully");
    }
}
