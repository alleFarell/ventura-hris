package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.PayrollRunExecutionRequest;
import com.ventura.hris.payroll.dto.PayrollRunItemResponse;
import com.ventura.hris.payroll.dto.PayrollRunResponse;
import com.ventura.hris.payroll.service.PayrollProcessingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/runs")
public class PayrollRunController {

    private final PayrollProcessingService processingService;

    public PayrollRunController(PayrollProcessingService processingService) {
        this.processingService = processingService;
    }

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<PayrollRunResponse>> executePayrollRun(
            @Valid @RequestBody PayrollRunExecutionRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "HR Admin";
        PayrollRunResponse response = processingService.executePayrollRun(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Payroll run batch executed successfully"));
    }

    @GetMapping
    public ApiResponse<List<PayrollRunResponse>> getAllPayrollRuns() {
        return ApiResponse.success(processingService.getAllPayrollRuns(), "Payroll runs retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PayrollRunResponse> getPayrollRunById(@PathVariable UUID id) {
        return ApiResponse.success(processingService.getPayrollRunById(id), "Payroll run retrieved successfully");
    }

    @GetMapping("/{id}/items")
    public ApiResponse<List<PayrollRunItemResponse>> getPayrollRunItems(@PathVariable UUID id) {
        return ApiResponse.success(processingService.getPayrollRunItems(id), "Payroll run items retrieved successfully");
    }

    @PostMapping("/{id}/freeze")
    public ApiResponse<PayrollRunResponse> freezePayrollRun(@PathVariable UUID id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "HR Admin";
        return ApiResponse.success(processingService.freezePayrollRun(id, username), "Payroll run frozen successfully");
    }
}
