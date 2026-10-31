package com.ventura.hris.performance.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.performance.dto.Feedback360Request;
import com.ventura.hris.performance.dto.Feedback360Response;
import com.ventura.hris.performance.dto.Feedback360SubmitRequest;
import com.ventura.hris.performance.service.Appraisal360FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/performance/feedback")
public class Appraisal360FeedbackController {

    private final Appraisal360FeedbackService feedbackService;

    public Appraisal360FeedbackController(Appraisal360FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Feedback360Response>> requestFeedback(
            @Valid @RequestBody Feedback360Request request) {
        Feedback360Response response = feedbackService.requestFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "360 Feedback requested successfully"));
    }

    @GetMapping
    public ApiResponse<List<Feedback360Response>> getFeedbacks(
            @RequestParam(required = false) UUID appraisalId,
            @RequestParam(required = false) UUID reviewerId) {
        return ApiResponse.success(feedbackService.getFeedbacks(appraisalId, reviewerId), "360 Feedbacks retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<Feedback360Response> getFeedbackById(@PathVariable UUID id) {
        return ApiResponse.success(feedbackService.getFeedback(id), "Feedback retrieved successfully");
    }

    @PostMapping("/{id}/respond")
    public ApiResponse<Feedback360Response> submitFeedback(
            @PathVariable UUID id,
            @Valid @RequestBody Feedback360SubmitRequest request) {
        return ApiResponse.success(feedbackService.submitFeedback(id, request), "Feedback response submitted successfully");
    }
}
