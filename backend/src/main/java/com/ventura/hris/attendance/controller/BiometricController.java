package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.BiometricPunchImportRequest;
import com.ventura.hris.attendance.service.AttendanceService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/attendance/biometrics")
public class BiometricController {

    private final AttendanceService attendanceService;

    public BiometricController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/import")
    public ApiResponse<Map<String, Integer>> importPunches(@Valid @RequestBody BiometricPunchImportRequest request) {
        int count = attendanceService.importBiometricPunches(request);
        return ApiResponse.success(Map.of("importedCount", count), "Biometric punches imported successfully");
    }
}
