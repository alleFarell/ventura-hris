package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.EmployeeReimbursementCreateRequest;
import com.ventura.hris.payroll.dto.EmployeeReimbursementResponse;
import com.ventura.hris.payroll.service.EmployeeReimbursementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/reimbursements")
public class EmployeeReimbursementController {

    private final EmployeeReimbursementService reimbursementService;

    public EmployeeReimbursementController(EmployeeReimbursementService reimbursementService) {
        this.reimbursementService = reimbursementService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeReimbursementResponse>> submitReimbursement(
            @Valid @RequestBody EmployeeReimbursementCreateRequest request
    ) {
        EmployeeReimbursementResponse response = reimbursementService.submitReimbursement(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Expense reimbursement submitted successfully"));
    }

    @GetMapping
    public ApiResponse<List<EmployeeReimbursementResponse>> getAllReimbursements(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.success(reimbursementService.getAllReimbursements(employeeId, status), "Reimbursements retrieved successfully");
    }

    @PutMapping("/{id}/approve")
    public ApiResponse<EmployeeReimbursementResponse> approveReimbursement(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "HR Admin";
        return ApiResponse.success(reimbursementService.approveReimbursement(id, username), "Reimbursement approved successfully");
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<EmployeeReimbursementResponse> rejectReimbursement(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "HR Admin";
        return ApiResponse.success(reimbursementService.rejectReimbursement(id, username), "Reimbursement rejected successfully");
    }
}
