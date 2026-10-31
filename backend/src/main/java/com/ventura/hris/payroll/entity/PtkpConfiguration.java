package com.ventura.hris.payroll.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ptkp_configurations", uniqueConstraints = {
    @UniqueConstraint(name = "uk_ptkp_configurations_status", columnNames = {"tax_status"})
})
public class PtkpConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tax_status", nullable = false, length = 20)
    private String taxStatus;

    @Column(name = "annual_non_taxable_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal annualNonTaxableAmount;

    @Column(name = "description", length = 100)
    private String description;

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

    public PtkpConfiguration() {}

    public PtkpConfiguration(String taxStatus, BigDecimal annualNonTaxableAmount, String description) {
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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
