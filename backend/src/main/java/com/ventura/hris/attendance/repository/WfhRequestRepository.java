package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.WfhRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WfhRequestRepository extends JpaRepository<WfhRequest, UUID> {
    Optional<WfhRequest> findByEmployeeIdAndRequestDate(UUID employeeId, LocalDate date);
    List<WfhRequest> findByEmployeeIdOrderByRequestDateDesc(UUID employeeId);
    List<WfhRequest> findByStatusOrderByRequestDateDesc(String status);
    List<WfhRequest> findByApproverIdAndStatusOrderByCreatedAtDesc(UUID approverId, String status);
    boolean existsByEmployeeIdAndRequestDateAndStatus(UUID employeeId, LocalDate date, String status);
}
