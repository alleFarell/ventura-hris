package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class MonthlyAttendanceRecapResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private Integer periodYear;
    private Integer periodMonth;
    private Integer totalWorkingDays;
    private Integer totalDaysPresent;
    private Integer totalDaysAbsent;
    private Integer totalLateMinutes;
    private Integer totalEarlyDepartureMinutes;
    private BigDecimal totalOvertimeHours;
    private Integer totalPaidLeaveDays;
    private Integer totalUnpaidLeaveDays;
    private String status;
    private Instant lockedAt;
    private UUID lockedBy;
    private Instant createdAt;

    public static MonthlyAttendanceRecapResponse fromEntity(MonthlyAttendanceRecap recap) {
        MonthlyAttendanceRecapResponse res = new MonthlyAttendanceRecapResponse();
        res.setId(recap.getId());
        if (recap.getEmployee() != null) {
            res.setEmployeeId(recap.getEmployee().getId());
            res.setEmployeeNumber(recap.getEmployee().getEmployeeNumber());
            String name = (recap.getEmployee().getFirstName() + " " +
                    (recap.getEmployee().getLastName() != null ? recap.getEmployee().getLastName() : "")).trim();
            res.setEmployeeName(name);
        }
        res.setPeriodYear(recap.getPeriodYear());
        res.setPeriodMonth(recap.getPeriodMonth());
        res.setTotalWorkingDays(recap.getTotalWorkingDays());
        res.setTotalDaysPresent(recap.getTotalDaysPresent());
        res.setTotalDaysAbsent(recap.getTotalDaysAbsent());
        res.setTotalLateMinutes(recap.getTotalLateMinutes());
        res.setTotalEarlyDepartureMinutes(recap.getTotalEarlyDepartureMinutes());
        res.setTotalOvertimeHours(recap.getTotalOvertimeHours());
        res.setTotalPaidLeaveDays(recap.getTotalPaidLeaveDays());
        res.setTotalUnpaidLeaveDays(recap.getTotalUnpaidLeaveDays());
        res.setStatus(recap.getStatus());
        res.setLockedAt(recap.getLockedAt());
        res.setLockedBy(recap.getLockedBy());
        res.setCreatedAt(recap.getCreatedAt());
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

    public Integer getPeriodYear() {
        return periodYear;
    }

    public void setPeriodYear(Integer periodYear) {
        this.periodYear = periodYear;
    }

    public Integer getPeriodMonth() {
        return periodMonth;
    }

    public void setPeriodMonth(Integer periodMonth) {
        this.periodMonth = periodMonth;
    }

    public Integer getTotalWorkingDays() {
        return totalWorkingDays;
    }

    public void setTotalWorkingDays(Integer totalWorkingDays) {
        this.totalWorkingDays = totalWorkingDays;
    }

    public Integer getTotalDaysPresent() {
        return totalDaysPresent;
    }

    public void setTotalDaysPresent(Integer totalDaysPresent) {
        this.totalDaysPresent = totalDaysPresent;
    }

    public Integer getTotalDaysAbsent() {
        return totalDaysAbsent;
    }

    public void setTotalDaysAbsent(Integer totalDaysAbsent) {
        this.totalDaysAbsent = totalDaysAbsent;
    }

    public Integer getTotalLateMinutes() {
        return totalLateMinutes;
    }

    public void setTotalLateMinutes(Integer totalLateMinutes) {
        this.totalLateMinutes = totalLateMinutes;
    }

    public Integer getTotalEarlyDepartureMinutes() {
        return totalEarlyDepartureMinutes;
    }

    public void setTotalEarlyDepartureMinutes(Integer totalEarlyDepartureMinutes) {
        this.totalEarlyDepartureMinutes = totalEarlyDepartureMinutes;
    }

    public BigDecimal getTotalOvertimeHours() {
        return totalOvertimeHours;
    }

    public void setTotalOvertimeHours(BigDecimal totalOvertimeHours) {
        this.totalOvertimeHours = totalOvertimeHours;
    }

    public Integer getTotalPaidLeaveDays() {
        return totalPaidLeaveDays;
    }

    public void setTotalPaidLeaveDays(Integer totalPaidLeaveDays) {
        this.totalPaidLeaveDays = totalPaidLeaveDays;
    }

    public Integer getTotalUnpaidLeaveDays() {
        return totalUnpaidLeaveDays;
    }

    public void setTotalUnpaidLeaveDays(Integer totalUnpaidLeaveDays) {
        this.totalUnpaidLeaveDays = totalUnpaidLeaveDays;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public void setLockedAt(Instant lockedAt) {
        this.lockedAt = lockedAt;
    }

    public UUID getLockedBy() {
        return lockedBy;
    }

    public void setLockedBy(UUID lockedBy) {
        this.lockedBy = lockedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
