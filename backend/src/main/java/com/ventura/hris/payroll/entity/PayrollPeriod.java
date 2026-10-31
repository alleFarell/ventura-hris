package com.ventura.hris.payroll.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payroll_periods", uniqueConstraints = {
    @UniqueConstraint(name = "uk_payroll_periods_code", columnNames = {"code"})
})
public class PayrollPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "attendance_cutoff_date", nullable = false)
    private LocalDate attendanceCutoffDate;

    @Column(name = "payout_date", nullable = false)
    private LocalDate payoutDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PLANNED"; // PLANNED, ACTIVE, PROCESSING, COMPLETED, CLOSED

    @Column(name = "total_standard_workdays", nullable = false)
    private Integer totalStandardWorkdays = 20;

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

    public PayrollPeriod() {}

    public PayrollPeriod(String code, String name, LocalDate startDate, LocalDate endDate,
                         LocalDate attendanceCutoffDate, LocalDate payoutDate, Integer totalStandardWorkdays) {
        this.code = code;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.attendanceCutoffDate = attendanceCutoffDate;
        this.payoutDate = payoutDate;
        this.totalStandardWorkdays = totalStandardWorkdays != null ? totalStandardWorkdays : 20;
        this.status = "PLANNED";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getAttendanceCutoffDate() { return attendanceCutoffDate; }
    public void setAttendanceCutoffDate(LocalDate attendanceCutoffDate) { this.attendanceCutoffDate = attendanceCutoffDate; }

    public LocalDate getPayoutDate() { return payoutDate; }
    public void setPayoutDate(LocalDate payoutDate) { this.payoutDate = payoutDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalStandardWorkdays() { return totalStandardWorkdays; }
    public void setTotalStandardWorkdays(Integer totalStandardWorkdays) { this.totalStandardWorkdays = totalStandardWorkdays; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
