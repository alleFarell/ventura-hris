package com.ventura.hris.leave.dto;

import com.ventura.hris.leave.entity.LeaveBalance;
import java.util.UUID;

public class LeaveBalanceResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private UUID leaveTypeId;
    private String leaveTypeCode;
    private String leaveTypeName;
    private Integer year;
    private Integer totalQuota;
    private Integer carriedOver;
    private Integer used;
    private Integer pending;
    private Integer remainingQuota;

    public static LeaveBalanceResponse fromEntity(LeaveBalance balance) {
        LeaveBalanceResponse res = new LeaveBalanceResponse();
        res.setId(balance.getId());
        if (balance.getEmployee() != null) {
            res.setEmployeeId(balance.getEmployee().getId());
            res.setEmployeeNumber(balance.getEmployee().getEmployeeNumber());
            String name = (balance.getEmployee().getFirstName() + " " +
                    (balance.getEmployee().getLastName() != null ? balance.getEmployee().getLastName() : "")).trim();
            res.setEmployeeName(name);
        }
        if (balance.getLeaveType() != null) {
            res.setLeaveTypeId(balance.getLeaveType().getId());
            res.setLeaveTypeCode(balance.getLeaveType().getCode());
            res.setLeaveTypeName(balance.getLeaveType().getName());
        }
        res.setYear(balance.getYear());
        res.setTotalQuota(balance.getTotalQuota());
        res.setCarriedOver(balance.getCarriedOver());
        res.setUsed(balance.getUsed());
        res.setPending(balance.getPending());
        res.setRemainingQuota(balance.getRemainingQuota());
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

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getTotalQuota() {
        return totalQuota;
    }

    public void setTotalQuota(Integer totalQuota) {
        this.totalQuota = totalQuota;
    }

    public Integer getCarriedOver() {
        return carriedOver;
    }

    public void setCarriedOver(Integer carriedOver) {
        this.carriedOver = carriedOver;
    }

    public Integer getUsed() {
        return used;
    }

    public void setUsed(Integer used) {
        this.used = used;
    }

    public Integer getPending() {
        return pending;
    }

    public void setPending(Integer pending) {
        this.pending = pending;
    }

    public Integer getRemainingQuota() {
        return remainingQuota;
    }

    public void setRemainingQuota(Integer remainingQuota) {
        this.remainingQuota = remainingQuota;
    }
}
