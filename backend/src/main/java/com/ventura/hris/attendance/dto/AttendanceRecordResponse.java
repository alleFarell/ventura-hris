package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.AttendanceRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AttendanceRecordResponse(
        UUID id,
        UUID employeeId,
        String employeeNumber,
        String employeeName,
        LocalDate recordDate,
        UUID shiftId,
        String shiftCode,
        Instant clockInTime,
        Instant clockOutTime,
        Integer lateMinutes,
        Integer earlyDepartureMinutes,
        BigDecimal workingHours,
        String status,
        String notes
) {
    public static AttendanceRecordResponse from(AttendanceRecord r) {
        String empNum = r.getEmployee() != null ? r.getEmployee().getEmployeeNumber() : null;
        String empName = r.getEmployee() != null
                ? (r.getEmployee().getFirstName() + (r.getEmployee().getLastName() != null ? " " + r.getEmployee().getLastName() : ""))
                : null;
        UUID sId = r.getShift() != null ? r.getShift().getId() : null;
        String sCode = r.getShift() != null ? r.getShift().getCode() : null;

        return new AttendanceRecordResponse(
                r.getId(),
                r.getEmployee() != null ? r.getEmployee().getId() : null,
                empNum,
                empName,
                r.getRecordDate(),
                sId,
                sCode,
                r.getClockInTime(),
                r.getClockOutTime(),
                r.getLateMinutes(),
                r.getEarlyDepartureMinutes(),
                r.getWorkingHours(),
                r.getStatus(),
                r.getNotes()
        );
    }
}
