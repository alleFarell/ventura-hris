package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class SalaryStructureResponse {

    private UUID id;
    private UUID gradeId;
    private String gradeCode;
    private String gradeName;
    private BigDecimal minSalary;
    private BigDecimal midpointSalary;
    private BigDecimal maxSalary;
    private String currency;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public SalaryStructureResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getGradeId() { return gradeId; }
    public void setGradeId(UUID gradeId) { this.gradeId = gradeId; }

    public String getGradeCode() { return gradeCode; }
    public void setGradeCode(String gradeCode) { this.gradeCode = gradeCode; }

    public String getGradeName() { return gradeName; }
    public void setGradeName(String gradeName) { this.gradeName = gradeName; }

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
