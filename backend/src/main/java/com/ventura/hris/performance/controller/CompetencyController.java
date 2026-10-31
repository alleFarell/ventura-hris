package com.ventura.hris.performance.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.performance.dto.CompetencyModelRequest;
import com.ventura.hris.performance.dto.CompetencyModelResponse;
import com.ventura.hris.performance.service.CompetencyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/performance/competencies")
public class CompetencyController {

    private final CompetencyService competencyService;

    public CompetencyController(CompetencyService competencyService) {
        this.competencyService = competencyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompetencyModelResponse>> createCompetency(
            @Valid @RequestBody CompetencyModelRequest request) {
        CompetencyModelResponse response = competencyService.createCompetency(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Competency created successfully"));
    }

    @GetMapping
    public ApiResponse<List<CompetencyModelResponse>> getCompetencies(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String category) {
        return ApiResponse.success(competencyService.getCompetencies(companyId, category), "Competencies retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<CompetencyModelResponse> getCompetencyById(@PathVariable UUID id) {
        return ApiResponse.success(competencyService.getCompetency(id), "Competency retrieved successfully");
    }
}
