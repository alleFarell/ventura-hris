package com.ventura.hris.payroll.entity;

import com.ventura.hris.organization.entity.Grade;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "salary_structures", uniqueConstraints = {
    @UniqueConstraint(name = "uk_salary_structures_grade", columnNames = {"grade_id"})
})
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grade_id", nullable = false)
    private Grade grade;

    @Column(name = "min_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal minSalary = BigDecimal.ZERO;

    @Column(name = "midpoint_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal midpointSalary = BigDecimal.ZERO;

    @Column(name = "max_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal maxSalary = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "IDR";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

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

    public SalaryStructure() {}

    public SalaryStructure(Grade grade, BigDecimal minSalary, BigDecimal midpointSalary, BigDecimal maxSalary, String currency) {
        this.grade = grade;
        this.minSalary = minSalary;
        this.midpointSalary = midpointSalary;
        this.maxSalary = maxSalary;
        this.currency = currency != null ? currency : "IDR";
        this.isActive = true;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Grade getGrade() { return grade; }
    public void setGrade(Grade grade) { this.grade = grade; }

    public BigDecimal getMinSalary() { return minSalary; }
    public void setMinSalary(BigDecimal minSalary) { this.minSalary = minSalary; }

    public BigDecimal getMidpointSalary() { return midpointSalary; }
    public void setMidpointSalary(BigDecimal midpointSalary) { this.midpointSalary = midpointSalary; }

    public BigDecimal getMaxSalary() { return maxSalary; }
    public void setMaxSalary(BigDecimal maxSalary) { this.maxSalary = maxSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
