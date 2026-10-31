package com.ventura.hris.recruitment.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.recruitment.dto.JobOfferRequest;
import com.ventura.hris.recruitment.dto.JobOfferResponse;
import com.ventura.hris.recruitment.dto.JobOfferStatusUpdateRequest;
import com.ventura.hris.recruitment.service.JobOfferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment/offers")
public class JobOfferController {

    private final JobOfferService jobOfferService;

    public JobOfferController(JobOfferService jobOfferService) {
        this.jobOfferService = jobOfferService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobOfferResponse>> createOffer(
            @Valid @RequestBody JobOfferRequest request) {
        JobOfferResponse response = jobOfferService.createOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Job offer created successfully"));
    }

    @GetMapping
    public ApiResponse<List<JobOfferResponse>> getOffers(
            @RequestParam(required = false) UUID applicationId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(jobOfferService.getOffers(applicationId, status), "Job offers retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<JobOfferResponse> getOfferById(@PathVariable UUID id) {
        return ApiResponse.success(jobOfferService.getOffer(id), "Job offer retrieved successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<JobOfferResponse> updateOfferStatus(
            @PathVariable UUID id,
            @Valid @RequestBody JobOfferStatusUpdateRequest request) {
        return ApiResponse.success(jobOfferService.updateOfferStatus(id, request), "Job offer status updated successfully");
    }
}
