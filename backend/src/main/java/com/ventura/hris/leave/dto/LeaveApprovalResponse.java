package com.ventura.hris.leave.dto;

import com.ventura.hris.leave.entity.LeaveApproval;
import java.time.Instant;
import java.util.UUID;

public class LeaveApprovalResponse {

    private UUID id;
    private UUID leaveRequestId;
    private UUID approverId;
    private String approverNumber;
    private String approverName;
    private Integer stepOrder;
    private String status;
    private String comments;
    private Instant actionedAt;
    private Instant createdAt;

    public static LeaveApprovalResponse fromEntity(LeaveApproval approval) {
        LeaveApprovalResponse res = new LeaveApprovalResponse();
        res.setId(approval.getId());
        if (approval.getLeaveRequest() != null) {
            res.setLeaveRequestId(approval.getLeaveRequest().getId());
        }
        if (approval.getApprover() != null) {
            res.setApproverId(approval.getApprover().getId());
            res.setApproverNumber(approval.getApprover().getEmployeeNumber());
            String name = (approval.getApprover().getFirstName() + " " +
                    (approval.getApprover().getLastName() != null ? approval.getApprover().getLastName() : "")).trim();
            res.setApproverName(name);
        }
        res.setStepOrder(approval.getStepOrder());
        res.setStatus(approval.getStatus());
        res.setComments(approval.getComments());
        res.setActionedAt(approval.getActionedAt());
        res.setCreatedAt(approval.getCreatedAt());
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getLeaveRequestId() {
        return leaveRequestId;
    }

    public void setLeaveRequestId(UUID leaveRequestId) {
        this.leaveRequestId = leaveRequestId;
    }

    public UUID getApproverId() {
        return approverId;
    }

    public void setApproverId(UUID approverId) {
        this.approverId = approverId;
    }

    public String getApproverNumber() {
        return approverNumber;
    }

    public void setApproverNumber(String approverNumber) {
        this.approverNumber = approverNumber;
    }

    public String getApproverName() {
        return approverName;
    }

    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(Integer stepOrder) {
        this.stepOrder = stepOrder;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Instant getActionedAt() {
        return actionedAt;
    }

    public void setActionedAt(Instant actionedAt) {
        this.actionedAt = actionedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
