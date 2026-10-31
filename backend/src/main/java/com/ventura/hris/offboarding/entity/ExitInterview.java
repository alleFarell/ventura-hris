package com.ventura.hris.offboarding.entity;

import com.ventura.hris.employee.entity.Employee;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "exit_interviews")
public class ExitInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private OffboardingCase offboardingCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private Employee interviewer;

    @Column(name = "primary_reason", nullable = false, length = 100)
    private String primaryReason;

    @Column(name = "culture_rating", nullable = false)
    private Integer cultureRating = 5;

    @Column(name = "management_rating", nullable = false)
    private Integer managementRating = 5;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();

    public ExitInterview() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public OffboardingCase getOffboardingCase() {
        return offboardingCase;
    }

    public void setOffboardingCase(OffboardingCase offboardingCase) {
        this.offboardingCase = offboardingCase;
    }

    public Employee getInterviewer() {
        return interviewer;
    }

    public void setInterviewer(Employee interviewer) {
        this.interviewer = interviewer;
    }

    public String getPrimaryReason() {
        return primaryReason;
    }

    public void setPrimaryReason(String primaryReason) {
        this.primaryReason = primaryReason;
    }

    public Integer getCultureRating() {
        return cultureRating;
    }

    public void setCultureRating(Integer cultureRating) {
        this.cultureRating = cultureRating;
    }

    public Integer getManagementRating() {
        return managementRating;
    }

    public void setManagementRating(Integer managementRating) {
        this.managementRating = managementRating;
    }

    public String getFeedbackText() {
        return feedbackText;
    }

    public void setFeedbackText(String feedbackText) {
        this.feedbackText = feedbackText;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}
