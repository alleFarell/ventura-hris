package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class TaxConfigurationResponse {

    private UUID id;
    private Integer taxYear;
    private Integer bracketOrder;
    private BigDecimal minTaxableIncome;
    private BigDecimal maxTaxableIncome;
    private BigDecimal taxRatePercent;
    private Instant createdAt;
    private Instant updatedAt;

    public TaxConfigurationResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer taxYear) { this.taxYear = taxYear; }

    public Integer getBracketOrder() { return bracketOrder; }
    public void setBracketOrder(Integer bracketOrder) { this.bracketOrder = bracketOrder; }

    public BigDecimal getMinTaxableIncome() { return minTaxableIncome; }
    public void setMinTaxableIncome(BigDecimal minTaxableIncome) { this.minTaxableIncome = minTaxableIncome; }

    public BigDecimal getMaxTaxableIncome() { return maxTaxableIncome; }
    public void setMaxTaxableIncome(BigDecimal maxTaxableIncome) { this.maxTaxableIncome = maxTaxableIncome; }

    public BigDecimal getTaxRatePercent() { return taxRatePercent; }
    public void setTaxRatePercent(BigDecimal taxRatePercent) { this.taxRatePercent = taxRatePercent; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
