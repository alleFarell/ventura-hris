package com.ventura.hris.payroll.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payroll_run_items", uniqueConstraints = {
    @UniqueConstraint(name = "uk_payroll_run_item", columnNames = {"payroll_run_id", "employee_id"})
})
public class PayrollRunItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "basic_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(name = "prorated_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal proratedAmount = BigDecimal.ZERO;

    @Column(name = "allowances_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal allowancesAmount = BigDecimal.ZERO;

    @Column(name = "overtime_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal overtimeAmount = BigDecimal.ZERO;

    @Column(name = "reimbursement_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal reimbursementAmount = BigDecimal.ZERO;

    @Column(name = "attendance_deduction_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal attendanceDeductionAmount = BigDecimal.ZERO;

    @Column(name = "loan_deduction_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal loanDeductionAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Column(name = "line_items_json", columnDefinition = "TEXT")
    private String lineItemsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public PayrollRunItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PayrollRun getPayrollRun() { return payrollRun; }
    public void setPayrollRun(PayrollRun payrollRun) { this.payrollRun = payrollRun; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public BigDecimal getBasicSalary() { return basicSalary; }
    public void setBasicSalary(BigDecimal basicSalary) { this.basicSalary = basicSalary; }

    public BigDecimal getProratedAmount() { return proratedAmount; }
    public void setProratedAmount(BigDecimal proratedAmount) { this.proratedAmount = proratedAmount; }

    public BigDecimal getAllowancesAmount() { return allowancesAmount; }
    public void setAllowancesAmount(BigDecimal allowancesAmount) { this.allowancesAmount = allowancesAmount; }

    public BigDecimal getOvertimeAmount() { return overtimeAmount; }
    public void setOvertimeAmount(BigDecimal overtimeAmount) { this.overtimeAmount = overtimeAmount; }

    public BigDecimal getReimbursementAmount() { return reimbursementAmount; }
    public void setReimbursementAmount(BigDecimal reimbursementAmount) { this.reimbursementAmount = reimbursementAmount; }

    public BigDecimal getAttendanceDeductionAmount() { return attendanceDeductionAmount; }
    public void setAttendanceDeductionAmount(BigDecimal attendanceDeductionAmount) { this.attendanceDeductionAmount = attendanceDeductionAmount; }

    public BigDecimal getLoanDeductionAmount() { return loanDeductionAmount; }
    public void setLoanDeductionAmount(BigDecimal loanDeductionAmount) { this.loanDeductionAmount = loanDeductionAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public String getLineItemsJson() { return lineItemsJson; }
    public void setLineItemsJson(String lineItemsJson) { this.lineItemsJson = lineItemsJson; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
