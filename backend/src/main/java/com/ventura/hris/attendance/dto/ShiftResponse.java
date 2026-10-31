package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.Shift;

import java.time.LocalTime;
import java.util.UUID;

public record ShiftResponse(
        UUID id,
        UUID companyId,
        String code,
        String name,
        String description,
        LocalTime startTime,
        LocalTime endTime,
        Integer breakMinutes,
        Integer gracePeriodMinutes,
        Boolean isOvernight,
        Boolean isActive
) {
    public static ShiftResponse from(Shift s) {
        return new ShiftResponse(
                s.getId(),
                s.getCompanyId(),
                s.getCode(),
                s.getName(),
                s.getDescription(),
                s.getStartTime(),
                s.getEndTime(),
                s.getBreakMinutes(),
                s.getGracePeriodMinutes(),
                s.getIsOvernight(),
                s.getIsActive()
        );
    }
}
