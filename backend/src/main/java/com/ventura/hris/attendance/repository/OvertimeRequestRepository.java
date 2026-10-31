package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, UUID> {
    List<OvertimeRequest> findByEmployeeIdOrderByOvertimeDateDesc(UUID employeeId);
    List<OvertimeRequest> findByStatusOrderByOvertimeDateDesc(String status);
    List<OvertimeRequest> findByApproverIdAndStatusOrderByCreatedAtDesc(UUID approverId, String status);
    List<OvertimeRequest> findByEmployeeIdAndOvertimeDateBetweenAndStatus(UUID employeeId, LocalDate start, LocalDate end, String status);
}
