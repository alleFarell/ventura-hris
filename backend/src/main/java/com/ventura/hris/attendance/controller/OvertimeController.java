package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.OvertimeActionRequest;
import com.ventura.hris.attendance.dto.OvertimeRequestCreateRequest;
import com.ventura.hris.attendance.dto.OvertimeRequestResponse;
import com.ventura.hris.attendance.service.OvertimeService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance/overtime")
public class OvertimeController {

    private final OvertimeService overtimeService;

    public OvertimeController(OvertimeService overtimeService) {
        this.overtimeService = overtimeService;
    }

    @GetMapping
    public ApiResponse<List<OvertimeRequestResponse>> getRequests(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status
    ) {
        List<OvertimeRequestResponse> list;
        if (employeeId != null) {
            list = overtimeService.getEmployeeOvertime(employeeId);
        } else {
            list = overtimeService.getAllRequests(status);
        }
        return ApiResponse.success(list, "Overtime requests retrieved");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OvertimeRequestResponse>> createRequest(
            @Valid @RequestBody OvertimeRequestCreateRequest req
    ) {
        OvertimeRequestResponse res = overtimeService.createOvertimeRequest(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Overtime request submitted successfully"));
    }

    @GetMapping("/inbox")
    public ApiResponse<List<OvertimeRequestResponse>> getInbox(
            @RequestParam UUID approverId,
            @RequestParam(required = false) String status
    ) {
        List<OvertimeRequestResponse> list = overtimeService.getApproverInbox(approverId, status);
        return ApiResponse.success(list, "Overtime inbox retrieved");
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<OvertimeRequestResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) OvertimeActionRequest req
    ) {
        String comment = req != null ? req.getComments() : null;
        OvertimeRequestResponse res = overtimeService.approveOvertime(id, comment);
        return ApiResponse.success(res, "Overtime request approved successfully");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<OvertimeRequestResponse> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) OvertimeActionRequest req
    ) {
        String comment = req != null ? req.getComments() : null;
        OvertimeRequestResponse res = overtimeService.rejectOvertime(id, comment);
        return ApiResponse.success(res, "Overtime request rejected");
    }
}
