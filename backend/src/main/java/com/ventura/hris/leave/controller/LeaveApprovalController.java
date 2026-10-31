package com.ventura.hris.leave.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.leave.dto.LeaveApprovalActionRequest;
import com.ventura.hris.leave.dto.LeaveApprovalResponse;
import com.ventura.hris.leave.dto.LeaveRequestResponse;
import com.ventura.hris.leave.service.LeaveApprovalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave/approvals")
public class LeaveApprovalController {

    private final LeaveApprovalService approvalService;

    public LeaveApprovalController(LeaveApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/inbox")
    public ApiResponse<List<LeaveApprovalResponse>> getInbox(
            @RequestParam UUID approverId,
            @RequestParam(required = false) String status
    ) {
        List<LeaveApprovalResponse> inbox = approvalService.getInbox(approverId, status);
        return ApiResponse.success(inbox, "Approval inbox retrieved successfully");
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<LeaveRequestResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) LeaveApprovalActionRequest req
    ) {
        String comments = req != null ? req.getComments() : null;
        LeaveRequestResponse res = approvalService.approve(id, comments);
        return ApiResponse.success(res, "Leave request approved successfully");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<LeaveRequestResponse> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) LeaveApprovalActionRequest req
    ) {
        String comments = req != null ? req.getComments() : null;
        LeaveRequestResponse res = approvalService.reject(id, comments);
        return ApiResponse.success(res, "Leave request rejected");
    }
}
