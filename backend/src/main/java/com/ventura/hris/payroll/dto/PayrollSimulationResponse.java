package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class PayrollSimulationResponse {

    private UUID id;
    private UUID periodId;
    private UUID employeeId;
    private String employeeName;
    private String employeeNumber;
    private BigDecimal basicSalary;
    private BigDecimal prorationFactor;
    private BigDecimal proratedBasicSalary;
    private BigDecimal fixedAllowances;
    private BigDecimal overtimeEarnings;
    private BigDecimal attendanceDeductions;
    private BigDecimal fixedDeductions;
    private BigDecimal taxDeduction;
    private BigDecimal grossSalary;
    private BigDecimal netSalary;
    private Boolean hasDiscrepancies;
    private String discrepancyNote;
    private String status;

    public PayrollSimulationResponse() {}

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

    public BigDecimal getBasicSalary() { return basicSalary; }
    public void setBasicSalary(BigDecimal basicSalary) { this.basicSalary = basicSalary; }

    public BigDecimal getProrationFactor() { return prorationFactor; }
    public void setProrationFactor(BigDecimal prorationFactor) { this.prorationFactor = prorationFactor; }

    public BigDecimal getProratedBasicSalary() { return proratedBasicSalary; }
    public void setProratedBasicSalary(BigDecimal proratedBasicSalary) { this.proratedBasicSalary = proratedBasicSalary; }

    public BigDecimal getFixedAllowances() { return fixedAllowances; }
    public void setFixedAllowances(BigDecimal fixedAllowances) { this.fixedAllowances = fixedAllowances; }

    public BigDecimal getOvertimeEarnings() { return overtimeEarnings; }
    public void setOvertimeEarnings(BigDecimal overtimeEarnings) { this.overtimeEarnings = overtimeEarnings; }

    public BigDecimal getAttendanceDeductions() { return attendanceDeductions; }
    public void setAttendanceDeductions(BigDecimal attendanceDeductions) { this.attendanceDeductions = attendanceDeductions; }

    public BigDecimal getFixedDeductions() { return fixedDeductions; }
    public void setFixedDeductions(BigDecimal fixedDeductions) { this.fixedDeductions = fixedDeductions; }

    public BigDecimal getTaxDeduction() { return taxDeduction; }
    public void setTaxDeduction(BigDecimal taxDeduction) { this.taxDeduction = taxDeduction; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public Boolean getHasDiscrepancies() { return hasDiscrepancies; }
    public void setHasDiscrepancies(Boolean hasDiscrepancies) { this.hasDiscrepancies = hasDiscrepancies; }

    public String getDiscrepancyNote() { return discrepancyNote; }
    public void setDiscrepancyNote(String discrepancyNote) { this.discrepancyNote = discrepancyNote; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
