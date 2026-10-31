package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.PayslipResponse;
import com.ventura.hris.payroll.service.PayslipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/payslips")
public class PayslipController {

    private final PayslipService payslipService;

    public PayslipController(PayslipService payslipService) {
        this.payslipService = payslipService;
    }

    @PostMapping("/generate/{payrollRunId}")
    public ResponseEntity<ApiResponse<List<PayslipResponse>>> generatePayslips(@PathVariable UUID payrollRunId) {
        List<PayslipResponse> responses = payslipService.generatePayslipsForRun(payrollRunId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(responses, "Payslips generated successfully"));
    }

    @GetMapping
    public ApiResponse<List<PayslipResponse>> getPayslips(@RequestParam(required = false) UUID employeeId) {
        return ApiResponse.success(payslipService.getPayslips(employeeId), "Payslips retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PayslipResponse> getPayslipById(@PathVariable UUID id) {
        return ApiResponse.success(payslipService.getPayslipById(id), "Payslip retrieved successfully");
    }

    @PostMapping("/publish/{payrollRunId}")
    public ApiResponse<List<PayslipResponse>> publishPayslips(@PathVariable UUID payrollRunId) {
        return ApiResponse.success(payslipService.publishPayslipsForRun(payrollRunId), "Payslips published to employee portal");
    }
}
