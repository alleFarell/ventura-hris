package com.ventura.hris.organization.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.organization.dto.CreateGradeRequest;
import com.ventura.hris.organization.dto.GradeResponse;
import com.ventura.hris.organization.dto.UpdateGradeRequest;
import com.ventura.hris.organization.service.JobStructureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grades")
public class GradeController {

    private final JobStructureService jobStructureService;

    public GradeController(JobStructureService jobStructureService) {
        this.jobStructureService = jobStructureService;
    }

    @GetMapping
    public ApiResponse<List<GradeResponse>> list(@RequestParam UUID companyId) {
        return ApiResponse.success(jobStructureService.listGrades(companyId), "Grades loaded");
    }

    @GetMapping("/{id}")
    public ApiResponse<GradeResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(jobStructureService.getGrade(id), "Grade loaded");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GradeResponse>> create(@Valid @RequestBody CreateGradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(jobStructureService.createGrade(request), "Grade created"));
    }

    @PutMapping("/{id}")
    public ApiResponse<GradeResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateGradeRequest request) {
        return ApiResponse.success(jobStructureService.updateGrade(id, request), "Grade updated");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        jobStructureService.deleteGrade(id);
        return ApiResponse.success(null, "Grade deleted");
    }
}
