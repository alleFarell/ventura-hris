package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.AttendanceRecordResponse;
import com.ventura.hris.attendance.dto.ClockInRequest;
import com.ventura.hris.attendance.dto.ClockOutRequest;
import com.ventura.hris.attendance.service.AttendanceService;
import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.api.PageMeta;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/clock-in")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> clockIn(@Valid @RequestBody ClockInRequest request) {
        AttendanceRecordResponse response = attendanceService.clockIn(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Clock-in recorded successfully"));
    }

    @PostMapping("/clock-out")
    public ApiResponse<AttendanceRecordResponse> clockOut(@Valid @RequestBody ClockOutRequest request) {
        AttendanceRecordResponse response = attendanceService.clockOut(request);
        return ApiResponse.success(response, "Clock-out recorded successfully");
    }

    @GetMapping("/my-today")
    public ApiResponse<AttendanceRecordResponse> getMyTodayRecord(@RequestParam UUID employeeId) {
        AttendanceRecordResponse response = attendanceService.getMyTodayRecord(employeeId).orElse(null);
        return ApiResponse.success(response, "Today's attendance retrieved");
    }

    @GetMapping("/records")
    public ApiResponse<List<AttendanceRecordResponse>> listRecords(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "recordDate"));
        Page<AttendanceRecordResponse> result = attendanceService.listRecords(start, end, employeeId, pageRequest);

        return ApiResponse.success(
                result.getContent(),
                "Attendance records retrieved successfully",
                PageMeta.from(result)
        );
    }
}
