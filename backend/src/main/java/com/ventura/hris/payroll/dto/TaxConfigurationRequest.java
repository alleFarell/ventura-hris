package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TaxConfigurationRequest {

    @NotNull(message = "Tax year is required")
    private Integer taxYear;

    @NotNull(message = "Bracket order is required")
    private Integer bracketOrder;

    @NotNull(message = "Minimum taxable income is required")
    private BigDecimal minTaxableIncome;

    private BigDecimal maxTaxableIncome;

    @NotNull(message = "Tax rate percent is required")
    private BigDecimal taxRatePercent;

    public TaxConfigurationRequest() {}

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
}
