package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.SalaryComponentCreateRequest;
import com.ventura.hris.payroll.dto.SalaryComponentResponse;
import com.ventura.hris.payroll.dto.SalaryComponentUpdateRequest;
import com.ventura.hris.payroll.service.SalaryComponentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/components")
public class SalaryComponentController {

    private final SalaryComponentService componentService;

    public SalaryComponentController(SalaryComponentService componentService) {
        this.componentService = componentService;
    }

    @GetMapping
    public ApiResponse<List<SalaryComponentResponse>> getAllComponents(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        List<SalaryComponentResponse> list = activeOnly ? componentService.getActiveComponents() : componentService.getAllComponents();
        return ApiResponse.success(list, "Salary components retrieved");
    }

    @GetMapping("/{id}")
    public ApiResponse<SalaryComponentResponse> getComponentById(@PathVariable UUID id) {
        SalaryComponentResponse res = componentService.getComponentById(id);
        return ApiResponse.success(res, "Salary component retrieved");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalaryComponentResponse>> createComponent(
            @Valid @RequestBody SalaryComponentCreateRequest req
    ) {
        SalaryComponentResponse res = componentService.createComponent(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Salary component created successfully"));
    }

    @PutMapping("/{id}")
    public ApiResponse<SalaryComponentResponse> updateComponent(
            @PathVariable UUID id,
            @Valid @RequestBody SalaryComponentUpdateRequest req
    ) {
        SalaryComponentResponse res = componentService.updateComponent(id, req);
        return ApiResponse.success(res, "Salary component updated successfully");
    }
}
