package com.ventura.hris.offboarding.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.offboarding.dto.OffboardingCaseRequest;
import com.ventura.hris.offboarding.dto.OffboardingCaseResponse;
import com.ventura.hris.offboarding.service.OffboardingCaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offboarding/cases")
public class OffboardingCaseController {

    private final OffboardingCaseService caseService;

    public OffboardingCaseController(OffboardingCaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OffboardingCaseResponse>> createCase(
            @Valid @RequestBody OffboardingCaseRequest request) {
        OffboardingCaseResponse response = caseService.createCase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Offboarding case initiated successfully"));
    }

    @GetMapping
    public ApiResponse<List<OffboardingCaseResponse>> getCases(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(caseService.getCases(employeeId, status), "Offboarding cases retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<OffboardingCaseResponse> getCaseById(@PathVariable UUID id) {
        return ApiResponse.success(caseService.getCaseById(id), "Offboarding case retrieved successfully");
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<OffboardingCaseResponse> cancelCase(@PathVariable UUID id) {
        return ApiResponse.success(caseService.cancelCase(id), "Offboarding case cancelled successfully");
    }
}
