package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class PayrollPeriodResponse {

    private UUID id;
    private String code;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate attendanceCutoffDate;
    private LocalDate payoutDate;
    private String status;
    private Integer totalStandardWorkdays;
    private Integer totalEmployeesIngested = 0;
    private BigDecimal totalSimulatedGross = BigDecimal.ZERO;
    private BigDecimal totalSimulatedNet = BigDecimal.ZERO;
    private Instant createdAt;
    private Instant updatedAt;

    public PayrollPeriodResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getAttendanceCutoffDate() { return attendanceCutoffDate; }
    public void setAttendanceCutoffDate(LocalDate attendanceCutoffDate) { this.attendanceCutoffDate = attendanceCutoffDate; }

    public LocalDate getPayoutDate() { return payoutDate; }
    public void setPayoutDate(LocalDate payoutDate) { this.payoutDate = payoutDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalStandardWorkdays() { return totalStandardWorkdays; }
    public void setTotalStandardWorkdays(Integer totalStandardWorkdays) { this.totalStandardWorkdays = totalStandardWorkdays; }

    public Integer getTotalEmployeesIngested() { return totalEmployeesIngested; }
    public void setTotalEmployeesIngested(Integer totalEmployeesIngested) { this.totalEmployeesIngested = totalEmployeesIngested; }

    public BigDecimal getTotalSimulatedGross() { return totalSimulatedGross; }
    public void setTotalSimulatedGross(BigDecimal totalSimulatedGross) { this.totalSimulatedGross = totalSimulatedGross; }

    public BigDecimal getTotalSimulatedNet() { return totalSimulatedNet; }
    public void setTotalSimulatedNet(BigDecimal totalSimulatedNet) { this.totalSimulatedNet = totalSimulatedNet; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
