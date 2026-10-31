package com.ventura.hris.payroll.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "employee_bpjs_enrollments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_employee_bpjs", columnNames = {"employee_id"})
})
public class EmployeeBpjsEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "bpjs_kes_number", length = 50)
    private String bpjsKesNumber;

    @Column(name = "bpjs_tk_number", length = 50)
    private String bpjsTkNumber;

    @Column(name = "jkk_risk_grade", nullable = false)
    private Integer jkkRiskGrade = 1; // 1 to 5

    @Column(name = "is_kes_active", nullable = false)
    private Boolean isKesActive = true;

    @Column(name = "is_tk_active", nullable = false)
    private Boolean isTkActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public EmployeeBpjsEnrollment() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getBpjsKesNumber() {
        return bpjsKesNumber;
    }

    public void setBpjsKesNumber(String bpjsKesNumber) {
        this.bpjsKesNumber = bpjsKesNumber;
    }

    public String getBpjsTkNumber() {
        return bpjsTkNumber;
    }

    public void setBpjsTkNumber(String bpjsTkNumber) {
        this.bpjsTkNumber = bpjsTkNumber;
    }

    public Integer getJkkRiskGrade() {
        return jkkRiskGrade;
    }

    public void setJkkRiskGrade(Integer jkkRiskGrade) {
        this.jkkRiskGrade = jkkRiskGrade;
    }

    public Boolean getIsKesActive() {
        return isKesActive;
    }

    public void setIsKesActive(Boolean isKesActive) {
        this.isKesActive = isKesActive;
    }

    public Boolean getIsTkActive() {
        return isTkActive;
    }

    public void setIsTkActive(Boolean isTkActive) {
        this.isTkActive = isTkActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
