package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.PayrollPeriodCreateRequest;
import com.ventura.hris.payroll.dto.PayrollPeriodResponse;
import com.ventura.hris.payroll.dto.PayrollPeriodStatusUpdateRequest;
import com.ventura.hris.payroll.service.PayrollPeriodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/periods")
public class PayrollPeriodController {

    private final PayrollPeriodService periodService;

    public PayrollPeriodController(PayrollPeriodService periodService) {
        this.periodService = periodService;
    }

    @GetMapping
    public ApiResponse<List<PayrollPeriodResponse>> getAllPeriods() {
        List<PayrollPeriodResponse> list = periodService.getAllPeriods();
        return ApiResponse.success(list, "Payroll periods retrieved");
    }

    @GetMapping("/{id}")
    public ApiResponse<PayrollPeriodResponse> getPeriodById(@PathVariable UUID id) {
        PayrollPeriodResponse res = periodService.getPeriodById(id);
        return ApiResponse.success(res, "Payroll period retrieved");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PayrollPeriodResponse>> createPeriod(
            @Valid @RequestBody PayrollPeriodCreateRequest req
    ) {
        PayrollPeriodResponse res = periodService.createPeriod(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Payroll period created successfully"));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<PayrollPeriodResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody PayrollPeriodStatusUpdateRequest req
    ) {
        PayrollPeriodResponse res = periodService.updateStatus(id, req.getStatus());
        return ApiResponse.success(res, "Payroll period status updated to " + req.getStatus());
    }
}
