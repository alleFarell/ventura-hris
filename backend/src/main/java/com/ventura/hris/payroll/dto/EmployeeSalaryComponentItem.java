package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class EmployeeSalaryComponentItem {

    @NotNull(message = "Component ID is required")
    private UUID componentId;

    private String componentCode;
    private String componentName;
    private String type;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    public EmployeeSalaryComponentItem() {}

    public EmployeeSalaryComponentItem(UUID componentId, String componentCode, String componentName, String type, BigDecimal amount) {
        this.componentId = componentId;
        this.componentCode = componentCode;
        this.componentName = componentName;
        this.type = type;
        this.amount = amount;
    }

    public UUID getComponentId() { return componentId; }
    public void setComponentId(UUID componentId) { this.componentId = componentId; }

    public String getComponentCode() { return componentCode; }
    public void setComponentCode(String componentCode) { this.componentCode = componentCode; }

    public String getComponentName() { return componentName; }
    public void setComponentName(String componentName) { this.componentName = componentName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
