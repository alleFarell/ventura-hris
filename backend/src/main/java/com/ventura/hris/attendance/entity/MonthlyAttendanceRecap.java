package com.ventura.hris.attendance.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "monthly_attendance_recaps", uniqueConstraints = {
    @UniqueConstraint(name = "uk_monthly_recaps_emp_period", columnNames = {"employee_id", "period_year", "period_month"})
})
public class MonthlyAttendanceRecap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "period_year", nullable = false)
    private Integer periodYear;

    @Column(name = "period_month", nullable = false)
    private Integer periodMonth;

    @Column(name = "total_working_days", nullable = false)
    private Integer totalWorkingDays = 0;

    @Column(name = "total_days_present", nullable = false)
    private Integer totalDaysPresent = 0;

    @Column(name = "total_days_absent", nullable = false)
    private Integer totalDaysAbsent = 0;

    @Column(name = "total_late_minutes", nullable = false)
    private Integer totalLateMinutes = 0;

    @Column(name = "total_early_departure_minutes", nullable = false)
    private Integer totalEarlyDepartureMinutes = 0;

    @Column(name = "total_overtime_hours", nullable = false, precision = 6, scale = 2)
    private BigDecimal totalOvertimeHours = BigDecimal.ZERO;

    @Column(name = "total_paid_leave_days", nullable = false)
    private Integer totalPaidLeaveDays = 0;

    @Column(name = "total_unpaid_leave_days", nullable = false)
    private Integer totalUnpaidLeaveDays = 0;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "DRAFT"; // DRAFT, VERIFIED, LOCKED_FOR_PAYROLL

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "locked_by")
    private UUID lockedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.totalWorkingDays == null) this.totalWorkingDays = 0;
        if (this.totalDaysPresent == null) this.totalDaysPresent = 0;
        if (this.totalDaysAbsent == null) this.totalDaysAbsent = 0;
        if (this.totalLateMinutes == null) this.totalLateMinutes = 0;
        if (this.totalEarlyDepartureMinutes == null) this.totalEarlyDepartureMinutes = 0;
        if (this.totalOvertimeHours == null) this.totalOvertimeHours = BigDecimal.ZERO;
        if (this.totalPaidLeaveDays == null) this.totalPaidLeaveDays = 0;
        if (this.totalUnpaidLeaveDays == null) this.totalUnpaidLeaveDays = 0;
        if (this.status == null) this.status = "DRAFT";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public MonthlyAttendanceRecap() {}

    public MonthlyAttendanceRecap(Employee employee, Integer periodYear, Integer periodMonth, Integer totalWorkingDays,
                                  Integer totalDaysPresent, Integer totalDaysAbsent, Integer totalLateMinutes,
                                  Integer totalEarlyDepartureMinutes, BigDecimal totalOvertimeHours,
                                  Integer totalPaidLeaveDays, Integer totalUnpaidLeaveDays, Instant lockedAt, String status) {
        this.employee = employee;
        this.periodYear = periodYear;
        this.periodMonth = periodMonth;
        this.totalWorkingDays = totalWorkingDays;
        this.totalDaysPresent = totalDaysPresent;
        this.totalDaysAbsent = totalDaysAbsent;
        this.totalLateMinutes = totalLateMinutes;
        this.totalEarlyDepartureMinutes = totalEarlyDepartureMinutes;
        this.totalOvertimeHours = totalOvertimeHours;
        this.totalPaidLeaveDays = totalPaidLeaveDays;
        this.totalUnpaidLeaveDays = totalUnpaidLeaveDays;
        this.lockedAt = lockedAt;
        this.status = status != null ? status : "DRAFT";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
