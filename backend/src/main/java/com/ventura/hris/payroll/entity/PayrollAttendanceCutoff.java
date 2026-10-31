package com.ventura.hris.payroll.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payroll_attendance_cutoffs", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pay_att_period_emp", columnNames = {"period_id", "employee_id"})
})
public class PayrollAttendanceCutoff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private PayrollPeriod period;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "total_workdays", nullable = false)
    private Integer totalWorkdays = 20;

    @Column(name = "present_days", nullable = false)
    private Integer presentDays = 0;

    @Column(name = "absent_days", nullable = false)
    private Integer absentDays = 0;

    @Column(name = "unpaid_leave_days", nullable = false)
    private Integer unpaidLeaveDays = 0;

    @Column(name = "late_minutes", nullable = false)
    private Integer lateMinutes = 0;

    @Column(name = "overtime_hours", nullable = false, precision = 6, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "overtime_pay_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal overtimePayAmount = BigDecimal.ZERO;

    @Column(name = "unpaid_leave_deduction_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal unpaidLeaveDeductionAmount = BigDecimal.ZERO;

    @Column(name = "late_fine_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal lateFineAmount = BigDecimal.ZERO;

    @Column(name = "is_synced", nullable = false)
    private Boolean isSynced = true;

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

    public PayrollAttendanceCutoff() {}

    public PayrollAttendanceCutoff(PayrollPeriod period, Employee employee, Integer totalWorkdays, Integer presentDays,
                                   Integer absentDays, Integer unpaidLeaveDays, Integer lateMinutes, BigDecimal overtimeHours,
                                   BigDecimal overtimePayAmount, BigDecimal unpaidLeaveDeductionAmount, BigDecimal lateFineAmount) {
        this.period = period;
        this.employee = employee;
        this.totalWorkdays = totalWorkdays != null ? totalWorkdays : 20;
        this.presentDays = presentDays != null ? presentDays : 0;
        this.absentDays = absentDays != null ? absentDays : 0;
        this.unpaidLeaveDays = unpaidLeaveDays != null ? unpaidLeaveDays : 0;
        this.lateMinutes = lateMinutes != null ? lateMinutes : 0;
        this.overtimeHours = overtimeHours != null ? overtimeHours : BigDecimal.ZERO;
        this.overtimePayAmount = overtimePayAmount != null ? overtimePayAmount : BigDecimal.ZERO;
        this.unpaidLeaveDeductionAmount = unpaidLeaveDeductionAmount != null ? unpaidLeaveDeductionAmount : BigDecimal.ZERO;
        this.lateFineAmount = lateFineAmount != null ? lateFineAmount : BigDecimal.ZERO;
        this.isSynced = true;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PayrollPeriod getPeriod() { return period; }
    public void setPeriod(PayrollPeriod period) { this.period = period; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

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

    public Boolean getIsSynced() { return isSynced; }
    public void setIsSynced(Boolean isSynced) { this.isSynced = isSynced; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
