package com.ventura.hris.offboarding.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.offboarding.dto.ExitInterviewRequest;
import com.ventura.hris.offboarding.dto.ExitInterviewResponse;
import com.ventura.hris.offboarding.service.ExitInterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offboarding/exit-interviews")
public class ExitInterviewController {

    private final ExitInterviewService exitInterviewService;

    public ExitInterviewController(ExitInterviewService exitInterviewService) {
        this.exitInterviewService = exitInterviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExitInterviewResponse>> submitExitInterview(
            @Valid @RequestBody ExitInterviewRequest request) {
        ExitInterviewResponse response = exitInterviewService.submitExitInterview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Exit interview submitted successfully"));
    }

    @GetMapping("/{caseId}")
    public ApiResponse<ExitInterviewResponse> getExitInterviewByCaseId(@PathVariable UUID caseId) {
        return ApiResponse.success(exitInterviewService.getExitInterviewByCaseId(caseId), "Exit interview retrieved successfully");
    }
}
