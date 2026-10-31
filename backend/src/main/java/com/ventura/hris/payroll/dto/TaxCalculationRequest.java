package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TaxCalculationRequest {

    @NotNull(message = "Annual gross income is required")
    private BigDecimal annualGrossIncome;

    @NotBlank(message = "Tax status is required (e.g. TK/0, K/1)")
    private String taxStatus = "TK/0";

    private Integer taxYear = 2026;

    public TaxCalculationRequest() {}

    public TaxCalculationRequest(BigDecimal annualGrossIncome, String taxStatus, Integer taxYear) {
        this.annualGrossIncome = annualGrossIncome;
        this.taxStatus = taxStatus;
        this.taxYear = taxYear != null ? taxYear : 2026;
    }

    public BigDecimal getAnnualGrossIncome() { return annualGrossIncome; }
    public void setAnnualGrossIncome(BigDecimal annualGrossIncome) { this.annualGrossIncome = annualGrossIncome; }

    public String getTaxStatus() { return taxStatus; }
    public void setTaxStatus(String taxStatus) { this.taxStatus = taxStatus; }

    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer taxYear) { this.taxYear = taxYear; }
}
