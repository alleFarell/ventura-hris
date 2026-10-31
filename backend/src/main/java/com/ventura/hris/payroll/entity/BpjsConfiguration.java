package com.ventura.hris.payroll.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bpjs_configurations", uniqueConstraints = {
    @UniqueConstraint(name = "uk_bpjs_program_type", columnNames = {"program_type"})
})
public class BpjsConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "program_type", nullable = false, length = 50)
    private String programType; // BPJS_KESEHATAN, BPJS_TK_JKK, BPJS_TK_JKM, BPJS_TK_JHT, BPJS_TK_JP

    @Column(name = "employer_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal employerRate;

    @Column(name = "employee_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal employeeRate;

    @Column(name = "wage_ceiling", precision = 15, scale = 2)
    private BigDecimal wageCeiling;

    @Column(name = "wage_floor", precision = 15, scale = 2)
    private BigDecimal wageFloor;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public BpjsConfiguration() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProgramType() {
        return programType;
    }

    public void setProgramType(String programType) {
        this.programType = programType;
    }

    public BigDecimal getEmployerRate() {
        return employerRate;
    }

    public void setEmployerRate(BigDecimal employerRate) {
        this.employerRate = employerRate;
    }

    public BigDecimal getEmployeeRate() {
        return employeeRate;
    }

    public void setEmployeeRate(BigDecimal employeeRate) {
        this.employeeRate = employeeRate;
    }

    public BigDecimal getWageCeiling() {
        return wageCeiling;
    }

    public void setWageCeiling(BigDecimal wageCeiling) {
        this.wageCeiling = wageCeiling;
    }

    public BigDecimal getWageFloor() {
        return wageFloor;
    }

    public void setWageFloor(BigDecimal wageFloor) {
        this.wageFloor = wageFloor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
