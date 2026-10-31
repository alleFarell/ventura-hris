package com.ventura.hris.recruitment.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.recruitment.dto.*;
import com.ventura.hris.recruitment.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // Candidates
    @GetMapping("/candidates")
    public ApiResponse<List<JobCandidateResponse>> getCandidates() {
        return ApiResponse.success(applicationService.getCandidates(), "Candidates retrieved successfully");
    }

    @PostMapping("/candidates")
    public ResponseEntity<ApiResponse<JobCandidateResponse>> registerCandidate(
            @Valid @RequestBody JobCandidateRequest request) {
        JobCandidateResponse response = applicationService.registerCandidate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Candidate registered successfully"));
    }

    @GetMapping("/candidates/{id}")
    public ApiResponse<JobCandidateResponse> getCandidateById(@PathVariable UUID id) {
        return ApiResponse.success(applicationService.getCandidate(id), "Candidate retrieved successfully");
    }

    // Applications
    @GetMapping("/applications")
    public ApiResponse<List<JobApplicationResponse>> getApplications(
            @RequestParam(required = false) UUID postingId,
            @RequestParam(required = false) String stage) {
        return ApiResponse.success(applicationService.getApplications(postingId, stage), "Applications retrieved successfully");
    }

    @GetMapping("/applications/{id}")
    public ApiResponse<JobApplicationResponse> getApplicationById(@PathVariable UUID id) {
        return ApiResponse.success(applicationService.getApplication(id), "Application retrieved successfully");
    }

    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> applyJob(
            @Valid @RequestBody JobApplicationRequest request) {
        JobApplicationResponse response = applicationService.applyJob(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Application submitted successfully"));
    }

    @PutMapping("/applications/{id}/stage")
    public ApiResponse<JobApplicationResponse> updateStage(
            @PathVariable UUID id,
            @Valid @RequestBody JobApplicationStageUpdateRequest request) {
        return ApiResponse.success(applicationService.updateStage(id, request), "Application stage updated successfully");
    }
}
