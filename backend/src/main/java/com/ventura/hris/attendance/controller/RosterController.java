package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.AssignRosterRequest;
import com.ventura.hris.attendance.dto.BulkPatternRosterRequest;
import com.ventura.hris.attendance.dto.RosterAssignmentResponse;
import com.ventura.hris.attendance.service.RosterService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roster")
public class RosterController {

    private final RosterService rosterService;

    public RosterController(RosterService rosterService) {
        this.rosterService = rosterService;
    }

    @GetMapping
    public ApiResponse<List<RosterAssignmentResponse>> getRoster(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID employeeId) {
        List<RosterAssignmentResponse> results;
        if (employeeId != null) {
            results = rosterService.getEmployeeRoster(employeeId, startDate, endDate);
        } else {
            results = rosterService.getRosterBetweenDates(startDate, endDate);
        }
        return ApiResponse.success(results, "Roster assignments retrieved successfully");
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<RosterAssignmentResponse>> assignRoster(@Valid @RequestBody AssignRosterRequest request) {
        RosterAssignmentResponse response = rosterService.assignRoster(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Roster assigned successfully"));
    }

    @PostMapping("/bulk-pattern")
    public ApiResponse<Map<String, Integer>> bulkPatternAssign(@Valid @RequestBody BulkPatternRosterRequest request) {
        int count = rosterService.bulkPatternAssign(request);
        return ApiResponse.success(Map.of("assignedCount", count), "Bulk roster pattern assigned successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRoster(@PathVariable UUID id) {
        rosterService.deleteRoster(id);
        return ApiResponse.success(null, "Roster assignment removed successfully");
    }
}
