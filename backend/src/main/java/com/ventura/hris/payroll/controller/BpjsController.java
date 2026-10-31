package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.service.BpjsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/bpjs")
public class BpjsController {

    private final BpjsService bpjsService;

    public BpjsController(BpjsService bpjsService) {
        this.bpjsService = bpjsService;
    }

    @GetMapping
    public ApiResponse<List<BpjsConfigurationResponse>> getAllConfigurations() {
        return ApiResponse.success(bpjsService.getAllConfigurations(), "BPJS configurations retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<BpjsConfigurationResponse> getConfigurationById(@PathVariable UUID id) {
        return ApiResponse.success(bpjsService.getConfiguration(id), "BPJS configuration retrieved successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<BpjsConfigurationResponse> updateConfiguration(
            @PathVariable UUID id,
            @Valid @RequestBody BpjsConfigurationUpdateRequest request) {
        return ApiResponse.success(bpjsService.updateConfiguration(id, request), "BPJS configuration updated successfully");
    }

    @PostMapping("/enrollments")
    public ResponseEntity<ApiResponse<EmployeeBpjsEnrollmentResponse>> enrollEmployee(
            @Valid @RequestBody EmployeeBpjsEnrollmentRequest request) {
        EmployeeBpjsEnrollmentResponse response = bpjsService.enrollEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Employee BPJS enrollment saved successfully"));
    }

    @GetMapping("/enrollments/{employeeId}")
    public ApiResponse<EmployeeBpjsEnrollmentResponse> getEnrollmentByEmployee(@PathVariable UUID employeeId) {
        return ApiResponse.success(bpjsService.getEnrollmentByEmployee(employeeId), "BPJS enrollment retrieved successfully");
    }

    @GetMapping("/calculate")
    public ApiResponse<List<BpjsCalculationResult>> calculateBpjs(
            @RequestParam BigDecimal baseWage,
            @RequestParam(required = false, defaultValue = "1") Integer jkkRiskGrade) {
        return ApiResponse.success(bpjsService.calculateBpjs(baseWage, jkkRiskGrade), "BPJS calculation completed");
    }
}
