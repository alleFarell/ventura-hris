package com.ventura.hris.recruitment.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.recruitment.dto.InterviewEvaluationRequest;
import com.ventura.hris.recruitment.dto.InterviewEvaluationResponse;
import com.ventura.hris.recruitment.dto.InterviewScheduleRequest;
import com.ventura.hris.recruitment.dto.InterviewScheduleResponse;
import com.ventura.hris.recruitment.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewScheduleResponse>> scheduleInterview(
            @Valid @RequestBody InterviewScheduleRequest request) {
        InterviewScheduleResponse response = interviewService.scheduleInterview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Interview scheduled successfully"));
    }

    @GetMapping
    public ApiResponse<List<InterviewScheduleResponse>> getInterviews(
            @RequestParam(required = false) UUID applicationId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(interviewService.getInterviews(applicationId, status), "Interviews retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<InterviewScheduleResponse> getInterviewById(@PathVariable UUID id) {
        return ApiResponse.success(interviewService.getInterview(id), "Interview retrieved successfully");
    }

    @PostMapping("/{id}/evaluations")
    public ResponseEntity<ApiResponse<InterviewEvaluationResponse>> submitEvaluation(
            @PathVariable UUID id,
            @Valid @RequestBody InterviewEvaluationRequest request) {
        InterviewEvaluationResponse response = interviewService.submitEvaluation(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Interview evaluation submitted successfully"));
    }

    @GetMapping("/{id}/evaluations")
    public ApiResponse<List<InterviewEvaluationResponse>> getEvaluations(@PathVariable UUID id) {
        return ApiResponse.success(interviewService.getEvaluations(id), "Interview evaluations retrieved successfully");
    }
}
