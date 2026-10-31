package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.BankDisbursalBatchResponse;
import com.ventura.hris.payroll.dto.BankDisbursalGenerateRequest;
import com.ventura.hris.payroll.dto.BankDisbursalItemResponse;
import com.ventura.hris.payroll.service.BankDisbursalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/disbursals")
public class BankDisbursalController {

    private final BankDisbursalService disbursalService;

    public BankDisbursalController(BankDisbursalService disbursalService) {
        this.disbursalService = disbursalService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<BankDisbursalBatchResponse>> generateDisbursalBatch(
            @Valid @RequestBody BankDisbursalGenerateRequest request
    ) {
        BankDisbursalBatchResponse response = disbursalService.generateDisbursalBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bank disbursal batch generated successfully"));
    }

    @GetMapping
    public ApiResponse<List<BankDisbursalBatchResponse>> getAllBatches() {
        return ApiResponse.success(disbursalService.getAllBatches(), "Disbursal batches retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<BankDisbursalBatchResponse> getBatchById(@PathVariable UUID id) {
        return ApiResponse.success(disbursalService.getBatchById(id), "Disbursal batch retrieved successfully");
    }

    @GetMapping("/{id}/items")
    public ApiResponse<List<BankDisbursalItemResponse>> getBatchItems(@PathVariable UUID id) {
        return ApiResponse.success(disbursalService.getBatchItems(id), "Disbursal batch items retrieved successfully");
    }

    @PutMapping("/{id}/status")
    public ApiResponse<BankDisbursalBatchResponse> updateBatchStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload
    ) {
        String status = payload.getOrDefault("status", "DISBURSED");
        return ApiResponse.success(disbursalService.updateBatchStatus(id, status), "Disbursal batch status updated to " + status);
    }
}
