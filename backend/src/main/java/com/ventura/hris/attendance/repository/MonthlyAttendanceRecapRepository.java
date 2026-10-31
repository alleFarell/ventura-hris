package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonthlyAttendanceRecapRepository extends JpaRepository<MonthlyAttendanceRecap, UUID> {
    Optional<MonthlyAttendanceRecap> findByEmployeeIdAndPeriodYearAndPeriodMonth(UUID employeeId, Integer year, Integer month);
    List<MonthlyAttendanceRecap> findByPeriodYearAndPeriodMonth(Integer year, Integer month);
    List<MonthlyAttendanceRecap> findByPeriodYearAndPeriodMonthAndStatus(Integer year, Integer month, String status);
}
