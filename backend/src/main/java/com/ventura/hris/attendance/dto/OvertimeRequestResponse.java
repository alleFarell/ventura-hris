package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.OvertimeRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class OvertimeRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private LocalDate overtimeDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal rawHours;
    private BigDecimal multiplierHours;
    private String reason;
    private String status;
    private String compensationType;
    private UUID approverId;
    private String approverName;
    private String managerComment;
    private Instant actionedAt;
    private Instant createdAt;

    public static OvertimeRequestResponse fromEntity(OvertimeRequest req) {
        OvertimeRequestResponse res = new OvertimeRequestResponse();
        res.setId(req.getId());
        if (req.getEmployee() != null) {
            res.setEmployeeId(req.getEmployee().getId());
            res.setEmployeeNumber(req.getEmployee().getEmployeeNumber());
            String name = (req.getEmployee().getFirstName() + " " +
                    (req.getEmployee().getLastName() != null ? req.getEmployee().getLastName() : "")).trim();
            res.setEmployeeName(name);
        }
        res.setOvertimeDate(req.getOvertimeDate());
        res.setStartTime(req.getStartTime());
        res.setEndTime(req.getEndTime());
        res.setRawHours(req.getRawHours());
        res.setMultiplierHours(req.getMultiplierHours());
        res.setReason(req.getReason());
        res.setStatus(req.getStatus());
        res.setCompensationType(req.getCompensationType());
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

    public LocalDate getOvertimeDate() {
        return overtimeDate;
    }

    public void setOvertimeDate(LocalDate overtimeDate) {
        this.overtimeDate = overtimeDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getRawHours() {
        return rawHours;
    }

    public void setRawHours(BigDecimal rawHours) {
        this.rawHours = rawHours;
    }

    public BigDecimal getMultiplierHours() {
        return multiplierHours;
    }

    public void setMultiplierHours(BigDecimal multiplierHours) {
        this.multiplierHours = multiplierHours;
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

    public String getCompensationType() {
        return compensationType;
    }

    public void setCompensationType(String compensationType) {
        this.compensationType = compensationType;
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
