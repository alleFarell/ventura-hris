package com.ventura.hris.leave.repository;

import com.ventura.hris.leave.entity.LeaveApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveApprovalRepository extends JpaRepository<LeaveApproval, UUID> {
    List<LeaveApproval> findByApproverIdAndStatusOrderByCreatedAtDesc(UUID approverId, String status);
    List<LeaveApproval> findByLeaveRequestIdOrderByStepOrderAsc(UUID leaveRequestId);
    Optional<LeaveApproval> findByLeaveRequestIdAndApproverId(UUID leaveRequestId, UUID approverId);
}
