package com.ventura.hris.recruitment.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.recruitment.dto.JobRequisitionRequest;
import com.ventura.hris.recruitment.dto.JobRequisitionResponse;
import com.ventura.hris.recruitment.service.JobRequisitionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment/requisitions")
public class JobRequisitionController {

    private final JobRequisitionService requisitionService;

    public JobRequisitionController(JobRequisitionService requisitionService) {
        this.requisitionService = requisitionService;
    }

    @GetMapping
    public ApiResponse<List<JobRequisitionResponse>> getRequisitions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID departmentId) {
        return ApiResponse.success(requisitionService.getRequisitions(status, departmentId), "Requisitions retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<JobRequisitionResponse> getRequisitionById(@PathVariable UUID id) {
        return ApiResponse.success(requisitionService.getRequisition(id), "Requisition retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobRequisitionResponse>> createRequisition(
            @Valid @RequestBody JobRequisitionRequest request) {
        JobRequisitionResponse response = requisitionService.createRequisition(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Job requisition created successfully"));
    }

    @PutMapping("/{id}/submit")
    public ApiResponse<JobRequisitionResponse> submitRequisition(@PathVariable UUID id) {
        return ApiResponse.success(requisitionService.submitRequisition(id), "Requisition submitted for approval");
    }

    @PutMapping("/{id}/approve")
    public ApiResponse<JobRequisitionResponse> approveRequisition(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, UUID> body) {
        UUID approverId = body != null ? body.get("approverId") : null;
        return ApiResponse.success(requisitionService.approveRequisition(id, approverId), "Requisition approved successfully");
    }
}
