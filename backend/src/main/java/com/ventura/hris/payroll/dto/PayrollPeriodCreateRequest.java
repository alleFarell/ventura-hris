package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PayrollPeriodCreateRequest {

    @NotBlank(message = "Period code is required")
    private String code;

    @NotBlank(message = "Period name is required")
    private String name;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Attendance cutoff date is required")
    private LocalDate attendanceCutoffDate;

    @NotNull(message = "Payout date is required")
    private LocalDate payoutDate;

    private Integer totalStandardWorkdays = 20;

    public PayrollPeriodCreateRequest() {}

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

    public Integer getTotalStandardWorkdays() { return totalStandardWorkdays; }
    public void setTotalStandardWorkdays(Integer totalStandardWorkdays) { this.totalStandardWorkdays = totalStandardWorkdays; }
}
