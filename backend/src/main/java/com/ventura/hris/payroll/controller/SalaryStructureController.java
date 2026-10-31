package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.SalaryStructureCreateRequest;
import com.ventura.hris.payroll.dto.SalaryStructureResponse;
import com.ventura.hris.payroll.service.SalaryStructureService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/structures")
public class SalaryStructureController {

    private final SalaryStructureService structureService;

    public SalaryStructureController(SalaryStructureService structureService) {
        this.structureService = structureService;
    }

    @GetMapping
    public ApiResponse<List<SalaryStructureResponse>> getAllStructures() {
        List<SalaryStructureResponse> list = structureService.getAllStructures();
        return ApiResponse.success(list, "Salary structures retrieved");
    }

    @GetMapping("/grade/{gradeId}")
    public ApiResponse<SalaryStructureResponse> getStructureByGrade(@PathVariable UUID gradeId) {
        SalaryStructureResponse res = structureService.getStructureByGrade(gradeId);
        return ApiResponse.success(res, "Salary structure retrieved for grade");
    }

    @PostMapping
    public ApiResponse<SalaryStructureResponse> createOrUpdateStructure(
            @Valid @RequestBody SalaryStructureCreateRequest req
    ) {
        SalaryStructureResponse res = structureService.createOrUpdateStructure(req);
        return ApiResponse.success(res, "Salary structure saved successfully");
    }
}
