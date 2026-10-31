package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.EmployeeSalaryProfileRequest;
import com.ventura.hris.payroll.dto.EmployeeSalaryProfileResponse;
import com.ventura.hris.payroll.service.CompensationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/compensation")
public class EmployeeCompensationController {

    private final CompensationService compensationService;

    public EmployeeCompensationController(CompensationService compensationService) {
        this.compensationService = compensationService;
    }

    @GetMapping("/{employeeId}")
    public ApiResponse<EmployeeSalaryProfileResponse> getCompensationProfile(@PathVariable UUID employeeId) {
        EmployeeSalaryProfileResponse res = compensationService.getEmployeeSalaryProfile(employeeId);
        return ApiResponse.success(res, "Employee salary profile retrieved");
    }

    @PutMapping("/{employeeId}")
    public ApiResponse<EmployeeSalaryProfileResponse> updateCompensationProfile(
            @PathVariable UUID employeeId,
            @Valid @RequestBody EmployeeSalaryProfileRequest req
    ) {
        EmployeeSalaryProfileResponse res = compensationService.saveOrUpdateEmployeeSalaryProfile(employeeId, req);
        return ApiResponse.success(res, "Employee salary profile saved successfully");
    }
}
