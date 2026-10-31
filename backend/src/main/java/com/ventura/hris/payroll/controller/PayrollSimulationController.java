package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.PayrollSimulationResponse;
import com.ventura.hris.payroll.service.PayrollSimulationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/periods/{periodId}/simulation")
public class PayrollSimulationController {

    private final PayrollSimulationService simulationService;

    public PayrollSimulationController(PayrollSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping
    public ApiResponse<List<PayrollSimulationResponse>> getSimulations(@PathVariable UUID periodId) {
        List<PayrollSimulationResponse> list = simulationService.getSimulations(periodId);
        return ApiResponse.success(list, "Payroll simulations retrieved");
    }

    @PostMapping("/simulate")
    public ApiResponse<List<PayrollSimulationResponse>> simulatePeriod(@PathVariable UUID periodId) {
        List<PayrollSimulationResponse> list = simulationService.simulatePeriod(periodId);
        return ApiResponse.success(list, "Payroll simulation generated successfully");
    }
}
