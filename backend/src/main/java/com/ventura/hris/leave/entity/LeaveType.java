package com.ventura.hris.leave.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leave_types", uniqueConstraints = {
    @UniqueConstraint(name = "uk_leave_types_code", columnNames = {"code"})
})
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "default_quota", nullable = false)
    private Integer defaultQuota = 0;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = true;

    @Column(name = "requires_attachment", nullable = false)
    private Boolean requiresAttachment = false;

    @Column(name = "max_consecutive_days", nullable = false)
    private Integer maxConsecutiveDays = 30;

    @Column(name = "carry_forward_allowed", nullable = false)
    private Boolean carryForwardAllowed = false;

    @Column(name = "max_carry_forward", nullable = false)
    private Integer maxCarryForward = 0;

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
        if (this.defaultQuota == null) this.defaultQuota = 0;
        if (this.isPaid == null) this.isPaid = true;
        if (this.requiresAttachment == null) this.requiresAttachment = false;
        if (this.maxConsecutiveDays == null) this.maxConsecutiveDays = 30;
        if (this.carryForwardAllowed == null) this.carryForwardAllowed = false;
        if (this.maxCarryForward == null) this.maxCarryForward = 0;
        if (this.isActive == null) this.isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDefaultQuota() {
        return defaultQuota;
    }

    public void setDefaultQuota(Integer defaultQuota) {
        this.defaultQuota = defaultQuota;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean paid) {
        isPaid = paid;
    }

    public Boolean getRequiresAttachment() {
        return requiresAttachment;
    }

    public void setRequiresAttachment(Boolean requiresAttachment) {
        this.requiresAttachment = requiresAttachment;
    }

    public Integer getMaxConsecutiveDays() {
        return maxConsecutiveDays;
    }

    public void setMaxConsecutiveDays(Integer maxConsecutiveDays) {
        this.maxConsecutiveDays = maxConsecutiveDays;
    }

    public Boolean getCarryForwardAllowed() {
        return carryForwardAllowed;
    }

    public void setCarryForwardAllowed(Boolean carryForwardAllowed) {
        this.carryForwardAllowed = carryForwardAllowed;
    }

    public Integer getMaxCarryForward() {
        return maxCarryForward;
    }

    public void setMaxCarryForward(Integer maxCarryForward) {
        this.maxCarryForward = maxCarryForward;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
