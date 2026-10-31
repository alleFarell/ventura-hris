package com.ventura.hris.leave.dto;

import com.ventura.hris.leave.entity.LeaveType;
import java.time.Instant;
import java.util.UUID;

public class LeaveTypeResponse {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private Integer defaultQuota;
    private Boolean isPaid;
    private Boolean requiresAttachment;
    private Integer maxConsecutiveDays;
    private Boolean carryForwardAllowed;
    private Integer maxCarryForward;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static LeaveTypeResponse fromEntity(LeaveType type) {
        LeaveTypeResponse response = new LeaveTypeResponse();
        response.setId(type.getId());
        response.setCode(type.getCode());
        response.setName(type.getName());
        response.setDescription(type.getDescription());
        response.setDefaultQuota(type.getDefaultQuota());
        response.setIsPaid(type.getIsPaid());
        response.setRequiresAttachment(type.getRequiresAttachment());
        response.setMaxConsecutiveDays(type.getMaxConsecutiveDays());
        response.setCarryForwardAllowed(type.getCarryForwardAllowed());
        response.setMaxCarryForward(type.getMaxCarryForward());
        response.setIsActive(type.getIsActive());
        response.setCreatedAt(type.getCreatedAt());
        response.setUpdatedAt(type.getUpdatedAt());
        return response;
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

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
