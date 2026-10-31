package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.CompanyHolidayRequest;
import com.ventura.hris.attendance.dto.CompanyHolidayResponse;
import com.ventura.hris.attendance.entity.CompanyHoliday;
import com.ventura.hris.attendance.repository.CompanyHolidayRepository;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CompanyHolidayService {

    private final CompanyHolidayRepository holidayRepository;

    public CompanyHolidayService(CompanyHolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyHolidayResponse> listHolidays(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return holidayRepository.findByHolidayDateBetweenOrderByHolidayDateAsc(startDate, endDate)
                    .stream()
                    .map(CompanyHolidayResponse::from)
                    .toList();
        }
        return holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream()
                .map(CompanyHolidayResponse::from)
                .toList();
    }

    public CompanyHolidayResponse createHoliday(CompanyHolidayRequest request) {
        CompanyHoliday holiday = new CompanyHoliday();
        holiday.setHolidayDate(request.holidayDate());
        holiday.setName(request.name());
        holiday.setDescription(request.description());
        holiday.setCompanyId(request.companyId());
        holiday.setBranchId(request.branchId());
        holiday.setIsMandatory(request.isMandatory() != null ? request.isMandatory() : true);

        return CompanyHolidayResponse.from(holidayRepository.save(holiday));
    }

    public CompanyHolidayResponse updateHoliday(UUID id, CompanyHolidayRequest request) {
        CompanyHoliday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyHoliday"));

        holiday.setHolidayDate(request.holidayDate());
        holiday.setName(request.name());
        holiday.setDescription(request.description());
        holiday.setCompanyId(request.companyId());
        holiday.setBranchId(request.branchId());
        if (request.isMandatory() != null) holiday.setIsMandatory(request.isMandatory());

        return CompanyHolidayResponse.from(holidayRepository.save(holiday));
    }

    public void deleteHoliday(UUID id) {
        CompanyHoliday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyHoliday"));
        holidayRepository.delete(holiday);
    }
}
