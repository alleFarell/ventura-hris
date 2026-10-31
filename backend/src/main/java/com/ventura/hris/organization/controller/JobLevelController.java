package com.ventura.hris.organization.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.organization.dto.CreateJobLevelRequest;
import com.ventura.hris.organization.dto.JobLevelResponse;
import com.ventura.hris.organization.dto.UpdateJobLevelRequest;
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
@RequestMapping("/api/v1/job-levels")
public class JobLevelController {

    private final JobStructureService jobStructureService;

    public JobLevelController(JobStructureService jobStructureService) {
        this.jobStructureService = jobStructureService;
    }

    @GetMapping
    public ApiResponse<List<JobLevelResponse>> list(@RequestParam UUID companyId) {
        return ApiResponse.success(jobStructureService.listJobLevels(companyId), "Job levels loaded");
    }

    @GetMapping("/{id}")
    public ApiResponse<JobLevelResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(jobStructureService.getJobLevel(id), "Job level loaded");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobLevelResponse>> create(@Valid @RequestBody CreateJobLevelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(jobStructureService.createJobLevel(request), "Job level created"));
    }

    @PutMapping("/{id}")
    public ApiResponse<JobLevelResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateJobLevelRequest request) {
        return ApiResponse.success(jobStructureService.updateJobLevel(id, request), "Job level updated");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        jobStructureService.deleteJobLevel(id);
        return ApiResponse.success(null, "Job level deleted");
    }
}
