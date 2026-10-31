package com.ventura.hris.payroll.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "salary_components", uniqueConstraints = {
    @UniqueConstraint(name = "uk_salary_components_code", columnNames = {"code"})
})
public class SalaryComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "type", nullable = false, length = 30)
    private String type; // EARNING_FIXED, EARNING_VARIABLE, DEDUCTION_FIXED, DEDUCTION_VARIABLE, BENEFIT_IN_KIND

    @Column(name = "is_taxable", nullable = false)
    private Boolean isTaxable = true;

    @Column(name = "is_bpjs_applicable", nullable = false)
    private Boolean isBpjsApplicable = true;

    @Column(name = "default_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal defaultAmount = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

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

    public SalaryComponent() {}

    public SalaryComponent(String code, String name, String description, String type, Boolean isTaxable, Boolean isBpjsApplicable, BigDecimal defaultAmount) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.type = type;
        this.isTaxable = isTaxable;
        this.isBpjsApplicable = isBpjsApplicable;
        this.defaultAmount = defaultAmount != null ? defaultAmount : BigDecimal.ZERO;
        this.isActive = true;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getIsTaxable() { return isTaxable; }
    public void setIsTaxable(Boolean isTaxable) { this.isTaxable = isTaxable; }

    public Boolean getIsBpjsApplicable() { return isBpjsApplicable; }
    public void setIsBpjsApplicable(Boolean isBpjsApplicable) { this.isBpjsApplicable = isBpjsApplicable; }

    public BigDecimal getDefaultAmount() { return defaultAmount; }
    public void setDefaultAmount(BigDecimal defaultAmount) { this.defaultAmount = defaultAmount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
