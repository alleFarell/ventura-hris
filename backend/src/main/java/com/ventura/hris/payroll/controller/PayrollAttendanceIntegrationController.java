package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.PayrollAttendanceCutoffResponse;
import com.ventura.hris.payroll.service.PayrollAttendanceIntegrationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll/periods/{periodId}/attendance")
public class PayrollAttendanceIntegrationController {

    private final PayrollAttendanceIntegrationService attendanceIntegrationService;

    public PayrollAttendanceIntegrationController(PayrollAttendanceIntegrationService attendanceIntegrationService) {
        this.attendanceIntegrationService = attendanceIntegrationService;
    }

    @GetMapping
    public ApiResponse<List<PayrollAttendanceCutoffResponse>> getAttendanceCutoffs(@PathVariable UUID periodId) {
        List<PayrollAttendanceCutoffResponse> list = attendanceIntegrationService.getAttendanceCutoffs(periodId);
        return ApiResponse.success(list, "Attendance cutoff records retrieved");
    }

    @PostMapping("/ingest")
    public ApiResponse<List<PayrollAttendanceCutoffResponse>> ingestAttendance(@PathVariable UUID periodId) {
        List<PayrollAttendanceCutoffResponse> list = attendanceIntegrationService.ingestAttendanceForPeriod(periodId);
        return ApiResponse.success(list, "Attendance records ingested for payroll period");
    }
}
