package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class EmployeeSalaryProfileResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeNumber;
    private UUID gradeId;
    private String gradeName;
    private BigDecimal basicSalary;
    private String currency;
    private LocalDate effectiveDate;
    private String paymentMethod;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;
    private String taxStatus;
    private BigDecimal gradeMinSalary;
    private BigDecimal gradeMaxSalary;
    private Boolean isWithinGradeRange;
    private List<EmployeeSalaryComponentItem> components = new ArrayList<>();
    private BigDecimal totalFixedAllowances = BigDecimal.ZERO;
    private BigDecimal totalFixedDeductions = BigDecimal.ZERO;
    private BigDecimal totalTakeHomePay = BigDecimal.ZERO;
    private Instant createdAt;
    private Instant updatedAt;

    public EmployeeSalaryProfileResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public UUID getGradeId() { return gradeId; }
    public void setGradeId(UUID gradeId) { this.gradeId = gradeId; }

    public String getGradeName() { return gradeName; }
    public void setGradeName(String gradeName) { this.gradeName = gradeName; }

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

    public BigDecimal getGradeMinSalary() { return gradeMinSalary; }
    public void setGradeMinSalary(BigDecimal gradeMinSalary) { this.gradeMinSalary = gradeMinSalary; }

    public BigDecimal getGradeMaxSalary() { return gradeMaxSalary; }
    public void setGradeMaxSalary(BigDecimal gradeMaxSalary) { this.gradeMaxSalary = gradeMaxSalary; }

    public Boolean getIsWithinGradeRange() { return isWithinGradeRange; }
    public void setIsWithinGradeRange(Boolean withinGradeRange) { isWithinGradeRange = withinGradeRange; }

    public List<EmployeeSalaryComponentItem> getComponents() { return components; }
    public void setComponents(List<EmployeeSalaryComponentItem> components) { this.components = components; }

    public BigDecimal getTotalFixedAllowances() { return totalFixedAllowances; }
    public void setTotalFixedAllowances(BigDecimal totalFixedAllowances) { this.totalFixedAllowances = totalFixedAllowances; }

    public BigDecimal getTotalFixedDeductions() { return totalFixedDeductions; }
    public void setTotalFixedDeductions(BigDecimal totalFixedDeductions) { this.totalFixedDeductions = totalFixedDeductions; }

    public BigDecimal getTotalTakeHomePay() { return totalTakeHomePay; }
    public void setTotalTakeHomePay(BigDecimal totalTakeHomePay) { this.totalTakeHomePay = totalTakeHomePay; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
