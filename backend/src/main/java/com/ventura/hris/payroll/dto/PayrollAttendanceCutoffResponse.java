package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class PayrollAttendanceCutoffResponse {

    private UUID id;
    private UUID periodId;
    private UUID employeeId;
    private String employeeName;
    private String employeeNumber;
    private Integer totalWorkdays;
    private Integer presentDays;
    private Integer absentDays;
    private Integer unpaidLeaveDays;
    private Integer lateMinutes;
    private BigDecimal overtimeHours;
    private BigDecimal overtimePayAmount;
    private BigDecimal unpaidLeaveDeductionAmount;
    private BigDecimal lateFineAmount;
    private BigDecimal totalAttendanceDeductions;
    private Boolean isSynced;

    public PayrollAttendanceCutoffResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPeriodId() { return periodId; }
    public void setPeriodId(UUID periodId) { this.periodId = periodId; }

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public Integer getTotalWorkdays() { return totalWorkdays; }
    public void setTotalWorkdays(Integer totalWorkdays) { this.totalWorkdays = totalWorkdays; }

    public Integer getPresentDays() { return presentDays; }
    public void setPresentDays(Integer presentDays) { this.presentDays = presentDays; }

    public Integer getAbsentDays() { return absentDays; }
    public void setAbsentDays(Integer absentDays) { this.absentDays = absentDays; }

    public Integer getUnpaidLeaveDays() { return unpaidLeaveDays; }
    public void setUnpaidLeaveDays(Integer unpaidLeaveDays) { this.unpaidLeaveDays = unpaidLeaveDays; }

    public Integer getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; }

    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

    public BigDecimal getOvertimePayAmount() { return overtimePayAmount; }
    public void setOvertimePayAmount(BigDecimal overtimePayAmount) { this.overtimePayAmount = overtimePayAmount; }

    public BigDecimal getUnpaidLeaveDeductionAmount() { return unpaidLeaveDeductionAmount; }
    public void setUnpaidLeaveDeductionAmount(BigDecimal unpaidLeaveDeductionAmount) { this.unpaidLeaveDeductionAmount = unpaidLeaveDeductionAmount; }

    public BigDecimal getLateFineAmount() { return lateFineAmount; }
    public void setLateFineAmount(BigDecimal lateFineAmount) { this.lateFineAmount = lateFineAmount; }

    public BigDecimal getTotalAttendanceDeductions() { return totalAttendanceDeductions; }
    public void setTotalAttendanceDeductions(BigDecimal totalAttendanceDeductions) { this.totalAttendanceDeductions = totalAttendanceDeductions; }

    public Boolean getIsSynced() { return isSynced; }
    public void setIsSynced(Boolean isSynced) { this.isSynced = isSynced; }
}
