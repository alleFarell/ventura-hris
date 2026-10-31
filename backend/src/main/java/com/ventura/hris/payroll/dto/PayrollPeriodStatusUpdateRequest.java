package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;

public class PayrollPeriodStatusUpdateRequest {

    @NotBlank(message = "Status is required (PLANNED, ACTIVE, PROCESSING, COMPLETED, CLOSED)")
    private String status;

    public PayrollPeriodStatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
