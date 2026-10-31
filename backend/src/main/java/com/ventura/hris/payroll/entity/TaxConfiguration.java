package com.ventura.hris.payroll.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tax_configurations", uniqueConstraints = {
    @UniqueConstraint(name = "uk_tax_configurations_year_order", columnNames = {"tax_year", "bracket_order"})
})
public class TaxConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tax_year", nullable = false)
    private Integer taxYear;

    @Column(name = "bracket_order", nullable = false)
    private Integer bracketOrder;

    @Column(name = "min_taxable_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal minTaxableIncome;

    @Column(name = "max_taxable_income", precision = 15, scale = 2)
    private BigDecimal maxTaxableIncome;

    @Column(name = "tax_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRatePercent;

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

    public TaxConfiguration() {}

    public TaxConfiguration(Integer taxYear, Integer bracketOrder, BigDecimal minTaxableIncome, BigDecimal maxTaxableIncome, BigDecimal taxRatePercent) {
        this.taxYear = taxYear;
        this.bracketOrder = bracketOrder;
        this.minTaxableIncome = minTaxableIncome;
        this.maxTaxableIncome = maxTaxableIncome;
        this.taxRatePercent = taxRatePercent;
    }

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
