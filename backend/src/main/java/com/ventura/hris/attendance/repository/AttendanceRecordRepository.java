package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.AttendanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findByEmployeeIdAndRecordDate(UUID employeeId, LocalDate recordDate);

    Page<AttendanceRecord> findByRecordDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<AttendanceRecord> findByEmployeeIdAndRecordDateBetween(UUID employeeId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<AttendanceRecord> findByEmployeeIdAndRecordDateBetweenOrderByRecordDateAsc(UUID employeeId, LocalDate startDate, LocalDate endDate);
}
