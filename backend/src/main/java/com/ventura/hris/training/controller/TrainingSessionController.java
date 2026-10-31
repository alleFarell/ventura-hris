package com.ventura.hris.training.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.training.dto.TrainingSessionRequest;
import com.ventura.hris.training.dto.TrainingSessionResponse;
import com.ventura.hris.training.service.TrainingSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/training/sessions")
public class TrainingSessionController {

    private final TrainingSessionService sessionService;

    public TrainingSessionController(TrainingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingSessionResponse>> createSession(@Valid @RequestBody TrainingSessionRequest request) {
        TrainingSessionResponse response = sessionService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Training session created successfully"));
    }

    @GetMapping
    public ApiResponse<List<TrainingSessionResponse>> getSessions(
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(sessionService.getSessions(courseId, status), "Training sessions retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TrainingSessionResponse> getSessionById(@PathVariable UUID id) {
        return ApiResponse.success(sessionService.getSessionById(id), "Training session retrieved successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<TrainingSessionResponse> updateSessionStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        return ApiResponse.success(sessionService.updateStatus(id, status), "Training session status updated successfully");
    }
}
