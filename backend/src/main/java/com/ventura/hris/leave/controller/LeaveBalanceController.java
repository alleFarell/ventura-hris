package com.ventura.hris.leave.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.leave.dto.LeaveBalanceAdjustRequest;
import com.ventura.hris.leave.dto.LeaveBalanceResponse;
import com.ventura.hris.leave.service.LeaveBalanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave/balances")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<LeaveBalanceResponse>> getBalancesForEmployee(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) Integer year
    ) {
        List<LeaveBalanceResponse> balances = leaveBalanceService.getBalancesForEmployee(employeeId, year);
        return ApiResponse.success(balances, "Leave balances retrieved successfully");
    }

    @PostMapping("/adjust")
    public ApiResponse<LeaveBalanceResponse> adjustBalance(
            @Valid @RequestBody LeaveBalanceAdjustRequest req
    ) {
        LeaveBalanceResponse res = leaveBalanceService.adjustBalance(req);
        return ApiResponse.success(res, "Leave balance adjusted successfully");
    }
}
