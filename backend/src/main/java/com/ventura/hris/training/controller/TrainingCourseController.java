package com.ventura.hris.training.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.training.dto.TrainingCourseRequest;
import com.ventura.hris.training.dto.TrainingCourseResponse;
import com.ventura.hris.training.service.TrainingCourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/training/courses")
public class TrainingCourseController {

    private final TrainingCourseService courseService;

    public TrainingCourseController(TrainingCourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingCourseResponse>> createCourse(@Valid @RequestBody TrainingCourseRequest request) {
        TrainingCourseResponse response = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Training course created successfully"));
    }

    @GetMapping
    public ApiResponse<List<TrainingCourseResponse>> getCourses(@RequestParam(required = false) UUID companyId) {
        return ApiResponse.success(courseService.getCourses(companyId), "Training courses retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TrainingCourseResponse> getCourseById(@PathVariable UUID id) {
        return ApiResponse.success(courseService.getCourseById(id), "Training course retrieved successfully");
    }
}
