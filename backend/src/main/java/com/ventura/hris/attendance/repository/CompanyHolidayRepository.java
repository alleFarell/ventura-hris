package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.CompanyHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyHolidayRepository extends JpaRepository<CompanyHoliday, UUID> {

    List<CompanyHoliday> findByHolidayDateBetweenOrderByHolidayDateAsc(LocalDate startDate, LocalDate endDate);

    List<CompanyHoliday> findAllByOrderByHolidayDateAsc();

    boolean existsByHolidayDateAndCompanyId(LocalDate holidayDate, UUID companyId);
}
