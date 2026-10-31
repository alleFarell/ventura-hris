package com.ventura.hris.leave.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.leave.dto.LeaveRequestCreateRequest;
import com.ventura.hris.leave.dto.LeaveRequestResponse;
import com.ventura.hris.leave.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave/requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping
    public ApiResponse<List<LeaveRequestResponse>> getRequests(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status
    ) {
        List<LeaveRequestResponse> list;
        if (employeeId != null) {
            list = leaveRequestService.getEmployeeRequests(employeeId);
        } else {
            list = leaveRequestService.getRequests(status);
        }
        return ApiResponse.success(list, "Leave requests retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<LeaveRequestResponse> getRequestById(@PathVariable UUID id) {
        LeaveRequestResponse res = leaveRequestService.getRequestById(id);
        return ApiResponse.success(res, "Leave request retrieved");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> createRequest(
            @Valid @RequestBody LeaveRequestCreateRequest req
    ) {
        LeaveRequestResponse res = leaveRequestService.createLeaveRequest(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Leave request submitted successfully"));
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<LeaveRequestResponse> cancelRequest(@PathVariable UUID id) {
        LeaveRequestResponse res = leaveRequestService.cancelLeaveRequest(id);
        return ApiResponse.success(res, "Leave request cancelled successfully");
    }

    @GetMapping("/calendar")
    public ApiResponse<List<LeaveRequestResponse>> getCalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<LeaveRequestResponse> list = leaveRequestService.getCalendarLeaves(startDate, endDate);
        return ApiResponse.success(list, "Calendar leave events retrieved");
    }
}
