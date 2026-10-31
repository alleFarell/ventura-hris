package com.ventura.hris.training.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.training.dto.EnrollmentStatusUpdateRequest;
import com.ventura.hris.training.dto.TrainingEnrollmentRequest;
import com.ventura.hris.training.dto.TrainingEnrollmentResponse;
import com.ventura.hris.training.service.TrainingEnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/training/enrollments")
public class TrainingEnrollmentController {

    private final TrainingEnrollmentService enrollmentService;

    public TrainingEnrollmentController(TrainingEnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingEnrollmentResponse>> enrollEmployee(
            @Valid @RequestBody TrainingEnrollmentRequest request) {
        TrainingEnrollmentResponse response = enrollmentService.enrollEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Employee enrolled successfully"));
    }

    @GetMapping
    public ApiResponse<List<TrainingEnrollmentResponse>> getEnrollments(
            @RequestParam(required = false) UUID sessionId,
            @RequestParam(required = false) UUID employeeId) {
        return ApiResponse.success(enrollmentService.getEnrollments(sessionId, employeeId), "Enrollments retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TrainingEnrollmentResponse> getEnrollmentById(@PathVariable UUID id) {
        return ApiResponse.success(enrollmentService.getEnrollmentById(id), "Enrollment retrieved successfully");
    }

    @PutMapping("/{id}/status")
    public ApiResponse<TrainingEnrollmentResponse> updateEnrollmentStatus(
            @PathVariable UUID id,
            @Valid @RequestBody EnrollmentStatusUpdateRequest request) {
        return ApiResponse.success(enrollmentService.updateEnrollmentStatus(id, request), "Enrollment status updated successfully");
    }
}
