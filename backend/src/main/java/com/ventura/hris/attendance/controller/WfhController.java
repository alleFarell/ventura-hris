package com.ventura.hris.attendance.controller;

import com.ventura.hris.attendance.dto.WfhActionRequest;
import com.ventura.hris.attendance.dto.WfhRequestCreateRequest;
import com.ventura.hris.attendance.dto.WfhRequestResponse;
import com.ventura.hris.attendance.service.WfhService;
import com.ventura.hris.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance/wfh")
public class WfhController {

    private final WfhService wfhService;

    public WfhController(WfhService wfhService) {
        this.wfhService = wfhService;
    }

    @GetMapping
    public ApiResponse<List<WfhRequestResponse>> getRequests(@RequestParam UUID employeeId) {
        List<WfhRequestResponse> list = wfhService.getEmployeeRequests(employeeId);
        return ApiResponse.success(list, "WFH requests retrieved");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WfhRequestResponse>> createRequest(@Valid @RequestBody WfhRequestCreateRequest req) {
        WfhRequestResponse res = wfhService.createWfhRequest(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "WFH request submitted successfully"));
    }

    @GetMapping("/inbox")
    public ApiResponse<List<WfhRequestResponse>> getInbox(
            @RequestParam UUID approverId,
            @RequestParam(required = false) String status
    ) {
        List<WfhRequestResponse> list = wfhService.getApproverInbox(approverId, status);
        return ApiResponse.success(list, "WFH inbox retrieved");
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<WfhRequestResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) WfhActionRequest req
    ) {
        String comment = req != null ? req.getComments() : null;
        WfhRequestResponse res = wfhService.approveWfhRequest(id, comment);
        return ApiResponse.success(res, "WFH request approved successfully");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<WfhRequestResponse> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) WfhActionRequest req
    ) {
        String comment = req != null ? req.getComments() : null;
        WfhRequestResponse res = wfhService.rejectWfhRequest(id, comment);
        return ApiResponse.success(res, "WFH request rejected");
    }
}
