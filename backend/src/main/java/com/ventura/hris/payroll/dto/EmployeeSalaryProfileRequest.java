package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EmployeeSalaryProfileRequest {

    @NotNull(message = "Basic salary is required")
    private BigDecimal basicSalary;

    private String currency = "IDR";

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    private String paymentMethod = "BANK_TRANSFER"; // BANK_TRANSFER, CASH, CHEQUE
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;

    @NotBlank(message = "Tax status is required")
    private String taxStatus = "TK/0";

    private List<EmployeeSalaryComponentItem> components = new ArrayList<>();

    public EmployeeSalaryProfileRequest() {}

    public BigDecimal getBasicSalary() { return basicSalary; }
    public void setBasicSalary(BigDecimal basicSalary) { this.basicSalary = basicSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getBankAccountHolder() { return bankAccountHolder; }
    public void setBankAccountHolder(String bankAccountHolder) { this.bankAccountHolder = bankAccountHolder; }

    public String getTaxStatus() { return taxStatus; }
    public void setTaxStatus(String taxStatus) { this.taxStatus = taxStatus; }

    public List<EmployeeSalaryComponentItem> getComponents() { return components; }
    public void setComponents(List<EmployeeSalaryComponentItem> components) { this.components = components; }
}
