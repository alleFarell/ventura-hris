package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class SalaryStructureCreateRequest {

    @NotNull(message = "Grade ID is required")
    private UUID gradeId;

    @NotNull(message = "Minimum salary is required")
    private BigDecimal minSalary;

    @NotNull(message = "Midpoint salary is required")
    private BigDecimal midpointSalary;

    @NotNull(message = "Maximum salary is required")
    private BigDecimal maxSalary;

    private String currency = "IDR";

    public SalaryStructureCreateRequest() {}

    public UUID getGradeId() { return gradeId; }
    public void setGradeId(UUID gradeId) { this.gradeId = gradeId; }

    public BigDecimal getMinSalary() { return minSalary; }
    public void setMinSalary(BigDecimal minSalary) { this.minSalary = minSalary; }

    public BigDecimal getMidpointSalary() { return midpointSalary; }
    public void setMidpointSalary(BigDecimal midpointSalary) { this.midpointSalary = midpointSalary; }

    public BigDecimal getMaxSalary() { return maxSalary; }
    public void setMaxSalary(BigDecimal maxSalary) { this.maxSalary = maxSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
