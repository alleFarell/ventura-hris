package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.ShiftPatternRequest;
import com.ventura.hris.attendance.dto.ShiftPatternResponse;
import com.ventura.hris.attendance.dto.ShiftRequest;
import com.ventura.hris.attendance.dto.ShiftResponse;
import com.ventura.hris.attendance.service.ShiftService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public ApiResponse<List<ShiftResponse>> listShifts() {
        return ApiResponse.success(shiftService.listShifts(), "Shifts retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<ShiftResponse> getShift(@PathVariable UUID id) {
        return ApiResponse.success(shiftService.getShift(id), "Shift retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShiftResponse>> createShift(@Valid @RequestBody ShiftRequest request) {
        ShiftResponse created = shiftService.createShift(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Shift created successfully"));
    }

    @PutMapping("/{id}")
    public ApiResponse<ShiftResponse> updateShift(@PathVariable UUID id, @Valid @RequestBody ShiftRequest request) {
        return ApiResponse.success(shiftService.updateShift(id, request), "Shift updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteShift(@PathVariable UUID id) {
        shiftService.deleteShift(id);
        return ApiResponse.success(null, "Shift deleted successfully");
    }

    @GetMapping("/patterns")
    public ApiResponse<List<ShiftPatternResponse>> listPatterns() {
        return ApiResponse.success(shiftService.listPatterns(), "Shift patterns retrieved successfully");
    }

    @PostMapping("/patterns")
    public ResponseEntity<ApiResponse<ShiftPatternResponse>> createPattern(@Valid @RequestBody ShiftPatternRequest request) {
        ShiftPatternResponse created = shiftService.createPattern(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Shift pattern created successfully"));
    }
}
