package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.CompanyHolidayRequest;
import com.ventura.hris.attendance.dto.CompanyHolidayResponse;
import com.ventura.hris.attendance.service.CompanyHolidayService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/holidays")
public class CompanyHolidayController {

    private final CompanyHolidayService holidayService;

    public CompanyHolidayController(CompanyHolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @GetMapping
    public ApiResponse<List<CompanyHolidayResponse>> listHolidays(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ApiResponse.success(holidayService.listHolidays(startDate, endDate), "Holidays retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyHolidayResponse>> createHoliday(@Valid @RequestBody CompanyHolidayRequest request) {
        CompanyHolidayResponse created = holidayService.createHoliday(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Holiday created successfully"));
    }

    @PutMapping("/{id}")
    public ApiResponse<CompanyHolidayResponse> updateHoliday(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyHolidayRequest request) {
        return ApiResponse.success(holidayService.updateHoliday(id, request), "Holiday updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteHoliday(@PathVariable UUID id) {
        holidayService.deleteHoliday(id);
        return ApiResponse.success(null, "Holiday deleted successfully");
    }
}
