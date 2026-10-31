package com.ventura.hris.attendance.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "overtime_requests")
public class OvertimeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "overtime_date", nullable = false)
    private LocalDate overtimeDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "raw_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal rawHours = BigDecimal.ZERO;

    @Column(name = "multiplier_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal multiplierHours = BigDecimal.ZERO;

    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "SUBMITTED"; // SUBMITTED, APPROVED, REJECTED, CANCELLED

    @Column(name = "compensation_type", nullable = false, length = 30)
    private String compensationType = "PAID"; // PAID, TIME_OFF_IN_LIEU

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private Employee approver;

    @Column(name = "manager_comment", length = 500)
    private String managerComment;

    @Column(name = "actioned_at")
    private Instant actionedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.rawHours == null) this.rawHours = BigDecimal.ZERO;
        if (this.multiplierHours == null) this.multiplierHours = BigDecimal.ZERO;
        if (this.status == null) this.status = "SUBMITTED";
        if (this.compensationType == null) this.compensationType = "PAID";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
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

    public Employee getApprover() {
        return approver;
    }

    public void setApprover(Employee approver) {
        this.approver = approver;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
