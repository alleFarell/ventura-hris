package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.EmployeeLoanCreateRequest;
import com.ventura.hris.payroll.dto.EmployeeLoanResponse;
import com.ventura.hris.payroll.service.EmployeeLoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/loans")
public class EmployeeLoanController {

    private final EmployeeLoanService loanService;

    public EmployeeLoanController(EmployeeLoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeLoanResponse>> createLoan(
            @Valid @RequestBody EmployeeLoanCreateRequest request
    ) {
        EmployeeLoanResponse response = loanService.createLoan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Employee loan created successfully"));
    }

    @GetMapping
    public ApiResponse<List<EmployeeLoanResponse>> getAllLoans(
            @RequestParam(required = false) UUID employeeId
    ) {
        return ApiResponse.success(loanService.getAllLoans(employeeId), "Employee loans retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeLoanResponse> getLoanById(@PathVariable UUID id) {
        return ApiResponse.success(loanService.getLoanById(id), "Employee loan retrieved successfully");
    }
}
