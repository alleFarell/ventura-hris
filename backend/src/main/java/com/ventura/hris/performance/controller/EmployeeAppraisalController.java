package com.ventura.hris.performance.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.performance.dto.AppraisalManagerReviewRequest;
import com.ventura.hris.performance.dto.AppraisalSelfReviewRequest;
import com.ventura.hris.performance.dto.EmployeeAppraisalRequest;
import com.ventura.hris.performance.dto.EmployeeAppraisalResponse;
import com.ventura.hris.performance.service.EmployeeAppraisalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/performance/appraisals")
public class EmployeeAppraisalController {

    private final EmployeeAppraisalService appraisalService;

    public EmployeeAppraisalController(EmployeeAppraisalService appraisalService) {
        this.appraisalService = appraisalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeAppraisalResponse>> initiateAppraisal(
            @Valid @RequestBody EmployeeAppraisalRequest request) {
        EmployeeAppraisalResponse response = appraisalService.initiateAppraisal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Appraisal initiated successfully"));
    }

    @GetMapping
    public ApiResponse<List<EmployeeAppraisalResponse>> getAppraisals(
            @RequestParam(required = false) UUID cycleId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(appraisalService.getAppraisals(cycleId, employeeId, status), "Appraisals retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeAppraisalResponse> getAppraisalById(@PathVariable UUID id) {
        return ApiResponse.success(appraisalService.getAppraisal(id), "Appraisal retrieved successfully");
    }

    @PutMapping("/{id}/submit-self")
    public ApiResponse<EmployeeAppraisalResponse> submitSelfReview(
            @PathVariable UUID id,
            @Valid @RequestBody AppraisalSelfReviewRequest request) {
        return ApiResponse.success(appraisalService.submitSelfReview(id, request), "Self review submitted successfully");
    }

    @PutMapping("/{id}/submit-manager")
    public ApiResponse<EmployeeAppraisalResponse> submitManagerReview(
            @PathVariable UUID id,
            @Valid @RequestBody AppraisalManagerReviewRequest request) {
        return ApiResponse.success(appraisalService.submitManagerReview(id, request), "Manager review submitted successfully");
    }
}
