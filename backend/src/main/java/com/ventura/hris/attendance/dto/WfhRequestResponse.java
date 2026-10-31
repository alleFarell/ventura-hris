package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.WfhRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class WfhRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private LocalDate requestDate;
    private String reason;
    private String status;
    private UUID approverId;
    private String approverName;
    private String managerComment;
    private Instant actionedAt;
    private Instant createdAt;

    public static WfhRequestResponse fromEntity(WfhRequest req) {
        WfhRequestResponse res = new WfhRequestResponse();
        res.setId(req.getId());
        if (req.getEmployee() != null) {
            res.setEmployeeId(req.getEmployee().getId());
            res.setEmployeeNumber(req.getEmployee().getEmployeeNumber());
            String name = (req.getEmployee().getFirstName() + " " +
                    (req.getEmployee().getLastName() != null ? req.getEmployee().getLastName() : "")).trim();
            res.setEmployeeName(name);
        }
        res.setRequestDate(req.getRequestDate());
        res.setReason(req.getReason());
        res.setStatus(req.getStatus());
        if (req.getApprover() != null) {
            res.setApproverId(req.getApprover().getId());
            String approverName = (req.getApprover().getFirstName() + " " +
                    (req.getApprover().getLastName() != null ? req.getApprover().getLastName() : "")).trim();
            res.setApproverName(approverName);
        }
        res.setManagerComment(req.getManagerComment());
        res.setActionedAt(req.getActionedAt());
        res.setCreatedAt(req.getCreatedAt());
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

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getApproverId() {
        return approverId;
    }

    public void setApproverId(UUID approverId) {
        this.approverId = approverId;
    }

    public String getApproverName() {
        return approverName;
    }

    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }

    public String getManagerComment() {
        return managerComment;
    }

    public void setManagerComment(String managerComment) {
        this.managerComment = managerComment;
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
