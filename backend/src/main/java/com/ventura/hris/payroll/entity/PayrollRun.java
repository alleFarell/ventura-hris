package com.ventura.hris.payroll.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payroll_runs", uniqueConstraints = {
    @UniqueConstraint(name = "uk_payroll_runs_number", columnNames = {"run_number"})
})
public class PayrollRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private PayrollPeriod period;

    @Column(name = "run_number", nullable = false, length = 50)
    private String runNumber;

    @Column(name = "execution_date", nullable = false)
    private LocalDate executionDate;

    @Column(name = "total_gross_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalGrossAmount = BigDecimal.ZERO;

    @Column(name = "total_deduction_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDeductionAmount = BigDecimal.ZERO;

    @Column(name = "total_net_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalNetAmount = BigDecimal.ZERO;

    @Column(name = "total_employees", nullable = false)
    private Integer totalEmployees = 0;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "DRAFT"; // DRAFT, PROCESSING, CONFIRMED, FROZEN

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

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

    public PayrollRun() {}

    public PayrollRun(PayrollPeriod period, String runNumber, LocalDate executionDate, String status) {
        this.period = period;
        this.runNumber = runNumber;
        this.executionDate = executionDate;
        this.status = status;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PayrollPeriod getPeriod() { return period; }
    public void setPeriod(PayrollPeriod period) { this.period = period; }

    public String getRunNumber() { return runNumber; }
    public void setRunNumber(String runNumber) { this.runNumber = runNumber; }

    public LocalDate getExecutionDate() { return executionDate; }
    public void setExecutionDate(LocalDate executionDate) { this.executionDate = executionDate; }

    public BigDecimal getTotalGrossAmount() { return totalGrossAmount; }
    public void setTotalGrossAmount(BigDecimal totalGrossAmount) { this.totalGrossAmount = totalGrossAmount; }

    public BigDecimal getTotalDeductionAmount() { return totalDeductionAmount; }
    public void setTotalDeductionAmount(BigDecimal totalDeductionAmount) { this.totalDeductionAmount = totalDeductionAmount; }

    public BigDecimal getTotalNetAmount() { return totalNetAmount; }
    public void setTotalNetAmount(BigDecimal totalNetAmount) { this.totalNetAmount = totalNetAmount; }

    public Integer getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(Integer totalEmployees) { this.totalEmployees = totalEmployees; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
