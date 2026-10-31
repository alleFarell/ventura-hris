package com.ventura.hris.leave.repository;

import com.ventura.hris.leave.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(String status);

    @Query("select r from LeaveRequest r where r.employee.id = :employeeId " +
           "and r.status in :statuses " +
           "and r.startDate <= :endDate and r.endDate >= :startDate")
    List<LeaveRequest> findOverlappingRequests(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") Collection<String> statuses
    );

    @Query("select r from LeaveRequest r where r.startDate <= :endDate and r.endDate >= :startDate and r.status = 'APPROVED'")
    List<LeaveRequest> findApprovedInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
