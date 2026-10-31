package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;

public class SalaryComponentUpdateRequest {

    private String name;
    private String description;
    private String type;
    private Boolean isTaxable;
    private Boolean isBpjsApplicable;
    private BigDecimal defaultAmount;
    private Boolean isActive;

    public SalaryComponentUpdateRequest() {}

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
}
