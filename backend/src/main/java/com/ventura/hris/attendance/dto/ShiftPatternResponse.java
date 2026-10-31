package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.ShiftPattern;

import java.util.UUID;

public record ShiftPatternResponse(
        UUID id,
        String code,
        String name,
        String description,
        String patternSequence,
        Integer cycleDays,
        Boolean isActive
) {
    public static ShiftPatternResponse from(ShiftPattern p) {
        return new ShiftPatternResponse(
                p.getId(),
                p.getCode(),
                p.getName(),
                p.getDescription(),
                p.getPatternSequence(),
                p.getCycleDays(),
                p.getIsActive()
        );
    }
}
