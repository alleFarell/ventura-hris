package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SalaryComponentCreateRequest {

    @NotBlank(message = "Component code is required")
    private String code;

    @NotBlank(message = "Component name is required")
    private String name;

    private String description;

    @NotBlank(message = "Component type is required")
    private String type; // EARNING_FIXED, EARNING_VARIABLE, DEDUCTION_FIXED, DEDUCTION_VARIABLE, BENEFIT_IN_KIND

    private Boolean isTaxable = true;
    private Boolean isBpjsApplicable = true;
    private BigDecimal defaultAmount = BigDecimal.ZERO;

    public SalaryComponentCreateRequest() {}

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
}
