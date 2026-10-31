package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class PtkpConfigurationResponse {

    private UUID id;
    private String taxStatus;
    private BigDecimal annualNonTaxableAmount;
    private String description;

    public PtkpConfigurationResponse() {}

    public PtkpConfigurationResponse(UUID id, String taxStatus, BigDecimal annualNonTaxableAmount, String description) {
        this.id = id;
        this.taxStatus = taxStatus;
        this.annualNonTaxableAmount = annualNonTaxableAmount;
        this.description = description;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTaxStatus() { return taxStatus; }
    public void setTaxStatus(String taxStatus) { this.taxStatus = taxStatus; }

    public BigDecimal getAnnualNonTaxableAmount() { return annualNonTaxableAmount; }
    public void setAnnualNonTaxableAmount(BigDecimal annualNonTaxableAmount) { this.annualNonTaxableAmount = annualNonTaxableAmount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
