package com.ventura.hris.training.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.training.dto.EmployeeCertificationRequest;
import com.ventura.hris.training.dto.EmployeeCertificationResponse;
import com.ventura.hris.training.service.EmployeeCertificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/training/certifications")
public class EmployeeCertificationController {

    private final EmployeeCertificationService certificationService;

    public EmployeeCertificationController(EmployeeCertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeCertificationResponse>> createCertification(
            @Valid @RequestBody EmployeeCertificationRequest request) {
        EmployeeCertificationResponse response = certificationService.createCertification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Certification created successfully"));
    }

    @GetMapping
    public ApiResponse<List<EmployeeCertificationResponse>> getCertifications(
            @RequestParam(required = false) UUID employeeId) {
        return ApiResponse.success(certificationService.getCertifications(employeeId), "Certifications retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeCertificationResponse> getCertificationById(@PathVariable UUID id) {
        return ApiResponse.success(certificationService.getCertificationById(id), "Certification retrieved successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCertification(@PathVariable UUID id) {
        certificationService.deleteCertification(id);
        return ApiResponse.success(null, "Certification deleted successfully");
    }
}
