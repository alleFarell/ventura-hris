package com.ventura.hris.performance.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "employee_appraisals", uniqueConstraints = {
    @UniqueConstraint(name = "uk_appraisal_cycle_employee", columnNames = {"cycle_id", "employee_id"})
})
public class EmployeeAppraisal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private PerformanceCycle cycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Column(name = "self_score", precision = 4, scale = 2)
    private BigDecimal selfScore;

    @Column(name = "manager_score", precision = 4, scale = 2)
    private BigDecimal managerScore;

    @Column(name = "final_score", precision = 4, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "performance_grade", length = 10)
    private String performanceGrade; // A, B, C, D

    @Column(name = "status", nullable = false, length = 30)
    private String status = "SELF_REVIEW"; // SELF_REVIEW, MANAGER_REVIEW, CALIBRATION, COMPLETED

    @Column(name = "self_comments", columnDefinition = "TEXT")
    private String selfComments;

    @Column(name = "manager_comments", columnDefinition = "TEXT")
    private String managerComments;

    @OneToMany(mappedBy = "appraisal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appraisal360Feedback> feedbacks = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public EmployeeAppraisal() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PerformanceCycle getCycle() {
        return cycle;
    }

    public void setCycle(PerformanceCycle cycle) {
        this.cycle = cycle;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Employee getManager() {
        return manager;
    }

    public void setManager(Employee manager) {
        this.manager = manager;
    }

    public BigDecimal getSelfScore() {
        return selfScore;
    }

    public void setSelfScore(BigDecimal selfScore) {
        this.selfScore = selfScore;
    }

    public BigDecimal getManagerScore() {
        return managerScore;
    }

    public void setManagerScore(BigDecimal managerScore) {
        this.managerScore = managerScore;
    }

    public BigDecimal getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(BigDecimal finalScore) {
        this.finalScore = finalScore;
    }

    public String getPerformanceGrade() {
        return performanceGrade;
    }

    public void setPerformanceGrade(String performanceGrade) {
        this.performanceGrade = performanceGrade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSelfComments() {
        return selfComments;
    }

    public void setSelfComments(String selfComments) {
        this.selfComments = selfComments;
    }

    public String getManagerComments() {
        return managerComments;
    }

    public void setManagerComments(String managerComments) {
        this.managerComments = managerComments;
    }

    public List<Appraisal360Feedback> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<Appraisal360Feedback> feedbacks) {
        this.feedbacks = feedbacks;
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
