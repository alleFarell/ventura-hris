package com.ventura.hris.payroll.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payroll_simulations", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pay_sim_period_emp", columnNames = {"period_id", "employee_id"})
})
public class PayrollSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private PayrollPeriod period;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "basic_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(name = "proration_factor", nullable = false, precision = 5, scale = 4)
    private BigDecimal prorationFactor = BigDecimal.ONE;

    @Column(name = "prorated_basic_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal proratedBasicSalary = BigDecimal.ZERO;

    @Column(name = "fixed_allowances", nullable = false, precision = 15, scale = 2)
    private BigDecimal fixedAllowances = BigDecimal.ZERO;

    @Column(name = "overtime_earnings", nullable = false, precision = 15, scale = 2)
    private BigDecimal overtimeEarnings = BigDecimal.ZERO;

    @Column(name = "attendance_deductions", nullable = false, precision = 15, scale = 2)
    private BigDecimal attendanceDeductions = BigDecimal.ZERO;

    @Column(name = "fixed_deductions", nullable = false, precision = 15, scale = 2)
    private BigDecimal fixedDeductions = BigDecimal.ZERO;

    @Column(name = "tax_deduction", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxDeduction = BigDecimal.ZERO;

    @Column(name = "gross_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossSalary = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Column(name = "has_discrepancies", nullable = false)
    private Boolean hasDiscrepancies = false;

    @Column(name = "discrepancy_note", length = 255)
    private String discrepancyNote;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "SIMULATED"; // SIMULATED, VERIFIED, FINALIZED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public PayrollSimulation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PayrollPeriod getPeriod() { return period; }
    public void setPeriod(PayrollPeriod period) { this.period = period; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
