package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.AttendanceRecapGenerateRequest;
import com.ventura.hris.attendance.dto.MonthlyAttendanceRecapResponse;
import com.ventura.hris.attendance.service.AttendanceRecapService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance/recaps")
public class AttendanceRecapController {

    private final AttendanceRecapService recapService;

    public AttendanceRecapController(AttendanceRecapService recapService) {
        this.recapService = recapService;
    }

    @GetMapping
    public ApiResponse<List<MonthlyAttendanceRecapResponse>> getRecaps(
            @RequestParam Integer year,
            @RequestParam Integer month
    ) {
        List<MonthlyAttendanceRecapResponse> list = recapService.getRecaps(year, month);
        return ApiResponse.success(list, "Monthly attendance recaps retrieved");
    }

    @PostMapping("/generate")
    public ApiResponse<List<MonthlyAttendanceRecapResponse>> generate(
            @Valid @RequestBody AttendanceRecapGenerateRequest req
    ) {
        List<MonthlyAttendanceRecapResponse> list = recapService.generateMonthlyRecap(req.getPeriodYear(), req.getPeriodMonth());
        return ApiResponse.success(list, "Monthly attendance recaps generated successfully");
    }

    @PutMapping("/{id}/lock")
    public ApiResponse<MonthlyAttendanceRecapResponse> lock(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID lockedBy
    ) {
        MonthlyAttendanceRecapResponse res = recapService.lockRecap(id, lockedBy);
        return ApiResponse.success(res, "Attendance recap locked for payroll");
    }

    @PostMapping("/lock-period")
    public ApiResponse<List<MonthlyAttendanceRecapResponse>> lockPeriod(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false) UUID lockedBy
    ) {
        List<MonthlyAttendanceRecapResponse> list = recapService.lockAllForPeriod(year, month, lockedBy);
        return ApiResponse.success(list, "All recaps for period locked for payroll");
    }
}
