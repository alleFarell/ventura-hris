package com.ventura.hris.leave.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class LeaveBalanceAdjustRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotNull(message = "Leave type ID is required")
    private UUID leaveTypeId;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Total quota is required")
    private Integer totalQuota;

    private Integer carriedOver = 0;

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public UUID getLeaveTypeId() {
        return leaveTypeId;
    }

    public void setLeaveTypeId(UUID leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
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
}
