package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.AttendancePunchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendancePunchLogRepository extends JpaRepository<AttendancePunchLog, UUID> {

    List<AttendancePunchLog> findByEmployeeIdAndPunchTimeBetweenOrderByPunchTimeAsc(
            UUID employeeId, Instant startTime, Instant endTime);
}
