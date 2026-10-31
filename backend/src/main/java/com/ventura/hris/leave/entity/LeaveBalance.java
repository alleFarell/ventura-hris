package com.ventura.hris.leave.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leave_balances", uniqueConstraints = {
    @UniqueConstraint(name = "uk_leave_balances_emp_type_year", columnNames = {"employee_id", "leave_type_id", "balance_year"})
})
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "balance_year", nullable = false)
    private Integer year;

    @Column(name = "total_quota", nullable = false)
    private Integer totalQuota = 0;

    @Column(name = "carried_over", nullable = false)
    private Integer carriedOver = 0;

    @Column(name = "used", nullable = false)
    private Integer used = 0;

    @Column(name = "pending", nullable = false)
    private Integer pending = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.totalQuota == null) this.totalQuota = 0;
        if (this.carriedOver == null) this.carriedOver = 0;
        if (this.used == null) this.used = 0;
        if (this.pending == null) this.pending = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Integer getRemainingQuota() {
        int total = (totalQuota != null ? totalQuota : 0) + (carriedOver != null ? carriedOver : 0);
        int consumed = (used != null ? used : 0) + (pending != null ? pending : 0);
        return Math.max(0, total - consumed);
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

    public LeaveType getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
