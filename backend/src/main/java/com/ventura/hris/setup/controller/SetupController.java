package com.ventura.hris.setup.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.setup.dto.SetupReadinessResponse;
import com.ventura.hris.setup.service.SetupReadinessService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/setup")
public class SetupController {

    private final SetupReadinessService setupReadinessService;

    public SetupController(SetupReadinessService setupReadinessService) {
        this.setupReadinessService = setupReadinessService;
    }

    @GetMapping("/readiness")
    ApiResponse<SetupReadinessResponse> readiness() {
        return ApiResponse.success(setupReadinessService.getReadiness(), "Setup readiness loaded");
    }
}
