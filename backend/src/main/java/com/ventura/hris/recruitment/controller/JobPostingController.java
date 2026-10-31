package com.ventura.hris.recruitment.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.recruitment.dto.JobPostingRequest;
import com.ventura.hris.recruitment.dto.JobPostingResponse;
import com.ventura.hris.recruitment.service.JobPostingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment/postings")
public class JobPostingController {

    private final JobPostingService postingService;

    public JobPostingController(JobPostingService postingService) {
        this.postingService = postingService;
    }

    @GetMapping
    public ApiResponse<List<JobPostingResponse>> getPostings(@RequestParam(required = false) Boolean publishedOnly) {
        return ApiResponse.success(postingService.getPostings(publishedOnly), "Job postings retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<JobPostingResponse> getPostingById(@PathVariable UUID id) {
        return ApiResponse.success(postingService.getPosting(id), "Job posting retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobPostingResponse>> createPosting(@Valid @RequestBody JobPostingRequest request) {
        JobPostingResponse response = postingService.createPosting(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Job posting created successfully"));
    }

    @PutMapping("/{id}/publish")
    public ApiResponse<JobPostingResponse> publishPosting(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Boolean> body) {
        boolean publish = body == null || !Boolean.FALSE.equals(body.get("publish"));
        return ApiResponse.success(postingService.publishPosting(id, publish), "Job posting publication status updated");
    }
}
