package com.ventura.hris.leave.dto;

import com.ventura.hris.leave.entity.LeaveRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class LeaveRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private UUID leaveTypeId;
    private String leaveTypeCode;
    private String leaveTypeName;
    private Boolean isPaid;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private String reason;
    private String attachmentUrl;
    private String status;
    private List<LeaveApprovalResponse> approvals = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public static LeaveRequestResponse fromEntity(LeaveRequest req) {
        LeaveRequestResponse res = new LeaveRequestResponse();
        res.setId(req.getId());
        if (req.getEmployee() != null) {
            res.setEmployeeId(req.getEmployee().getId());
            res.setEmployeeNumber(req.getEmployee().getEmployeeNumber());
            String name = (req.getEmployee().getFirstName() + " " +
                    (req.getEmployee().getLastName() != null ? req.getEmployee().getLastName() : "")).trim();
            res.setEmployeeName(name);
        }
        if (req.getLeaveType() != null) {
            res.setLeaveTypeId(req.getLeaveType().getId());
            res.setLeaveTypeCode(req.getLeaveType().getCode());
            res.setLeaveTypeName(req.getLeaveType().getName());
            res.setIsPaid(req.getLeaveType().getIsPaid());
        }
        res.setStartDate(req.getStartDate());
        res.setEndDate(req.getEndDate());
        res.setTotalDays(req.getTotalDays());
        res.setReason(req.getReason());
        res.setAttachmentUrl(req.getAttachmentUrl());
        res.setStatus(req.getStatus());
        if (req.getApprovals() != null) {
            res.setApprovals(req.getApprovals().stream()
                    .map(LeaveApprovalResponse::fromEntity)
                    .collect(Collectors.toList()));
        }
        res.setCreatedAt(req.getCreatedAt());
        res.setUpdatedAt(req.getUpdatedAt());
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public UUID getLeaveTypeId() {
        return leaveTypeId;
    }

    public void setLeaveTypeId(UUID leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
    }

    public String getLeaveTypeCode() {
        return leaveTypeCode;
    }

    public void setLeaveTypeCode(String leaveTypeCode) {
        this.leaveTypeCode = leaveTypeCode;
    }

    public String getLeaveTypeName() {
        return leaveTypeName;
    }

    public void setLeaveTypeName(String leaveTypeName) {
        this.leaveTypeName = leaveTypeName;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean paid) {
        isPaid = paid;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<LeaveApprovalResponse> getApprovals() {
        return approvals;
    }

    public void setApprovals(List<LeaveApprovalResponse> approvals) {
        this.approvals = approvals;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
