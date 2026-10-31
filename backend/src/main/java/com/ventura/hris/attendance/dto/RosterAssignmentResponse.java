package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.RosterAssignment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record RosterAssignmentResponse(
        UUID id,
        UUID employeeId,
        String employeeNumber,
        String employeeName,
        UUID shiftId,
        String shiftCode,
        String shiftName,
        LocalDate shiftDate,
        LocalTime startTime,
        LocalTime endTime,
        Boolean isDayOff,
        String overrideReason
) {
    public static RosterAssignmentResponse from(RosterAssignment r) {
        String empName = r.getEmployee() != null 
                ? (r.getEmployee().getFirstName() + (r.getEmployee().getLastName() != null ? " " + r.getEmployee().getLastName() : ""))
                : null;
        String empNum = r.getEmployee() != null ? r.getEmployee().getEmployeeNumber() : null;
        UUID sId = r.getShift() != null ? r.getShift().getId() : null;
        String sCode = r.getShift() != null ? r.getShift().getCode() : null;
        String sName = r.getShift() != null ? r.getShift().getName() : null;
        LocalTime sStart = r.getShift() != null ? r.getShift().getStartTime() : null;
        LocalTime sEnd = r.getShift() != null ? r.getShift().getEndTime() : null;

        return new RosterAssignmentResponse(
                r.getId(),
                r.getEmployee() != null ? r.getEmployee().getId() : null,
                empNum,
                empName,
                sId,
                sCode,
                sName,
                r.getShiftDate(),
                sStart,
                sEnd,
                r.getIsDayOff(),
                r.getOverrideReason()
        );
    }
}
