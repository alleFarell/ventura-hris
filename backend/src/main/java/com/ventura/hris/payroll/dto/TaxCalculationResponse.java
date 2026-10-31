package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class TaxCalculationResponse {

    private BigDecimal annualGrossIncome;
    private BigDecimal ptkpAmount;
    private BigDecimal annualTaxableIncome;
    private BigDecimal annualTaxAmount;
    private BigDecimal monthlyTaxAmount;
    private BigDecimal effectiveTaxRatePercent;
    private List<TaxBracketCalculationItem> breakdown = new ArrayList<>();

    public TaxCalculationResponse() {}

    public BigDecimal getAnnualGrossIncome() { return annualGrossIncome; }
    public void setAnnualGrossIncome(BigDecimal annualGrossIncome) { this.annualGrossIncome = annualGrossIncome; }

    public BigDecimal getPtkpAmount() { return ptkpAmount; }
    public void setPtkpAmount(BigDecimal ptkpAmount) { this.ptkpAmount = ptkpAmount; }

    public BigDecimal getAnnualTaxableIncome() { return annualTaxableIncome; }
    public void setAnnualTaxableIncome(BigDecimal annualTaxableIncome) { this.annualTaxableIncome = annualTaxableIncome; }

    public BigDecimal getAnnualTaxAmount() { return annualTaxAmount; }
    public void setAnnualTaxAmount(BigDecimal annualTaxAmount) { this.annualTaxAmount = annualTaxAmount; }

    public BigDecimal getMonthlyTaxAmount() { return monthlyTaxAmount; }
    public void setMonthlyTaxAmount(BigDecimal monthlyTaxAmount) { this.monthlyTaxAmount = monthlyTaxAmount; }

    public BigDecimal getEffectiveTaxRatePercent() { return effectiveTaxRatePercent; }
    public void setEffectiveTaxRatePercent(BigDecimal effectiveTaxRatePercent) { this.effectiveTaxRatePercent = effectiveTaxRatePercent; }

    public List<TaxBracketCalculationItem> getBreakdown() { return breakdown; }
    public void setBreakdown(List<TaxBracketCalculationItem> breakdown) { this.breakdown = breakdown; }
}
