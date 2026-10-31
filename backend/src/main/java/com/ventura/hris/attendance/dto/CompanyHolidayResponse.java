package com.ventura.hris.attendance.dto;

import com.ventura.hris.attendance.entity.CompanyHoliday;

import java.time.LocalDate;
import java.util.UUID;

public record CompanyHolidayResponse(
        UUID id,
        LocalDate holidayDate,
        String name,
        String description,
        UUID companyId,
        UUID branchId,
        Boolean isMandatory
) {
    public static CompanyHolidayResponse from(CompanyHoliday h) {
        return new CompanyHolidayResponse(
                h.getId(),
                h.getHolidayDate(),
                h.getName(),
                h.getDescription(),
                h.getCompanyId(),
                h.getBranchId(),
                h.getIsMandatory()
        );
    }
}
