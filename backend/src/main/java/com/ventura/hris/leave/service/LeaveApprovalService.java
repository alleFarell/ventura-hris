package com.ventura.hris.leave.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.leave.dto.LeaveApprovalResponse;
import com.ventura.hris.leave.dto.LeaveRequestResponse;
import com.ventura.hris.leave.entity.LeaveApproval;
import com.ventura.hris.leave.entity.LeaveRequest;
import com.ventura.hris.leave.repository.LeaveApprovalRepository;
import com.ventura.hris.leave.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveApprovalService {

    private final LeaveApprovalRepository approvalRepository;
    private final LeaveRequestRepository requestRepository;
    private final LeaveBalanceService balanceService;

    public LeaveApprovalService(
            LeaveApprovalRepository approvalRepository,
            LeaveRequestRepository requestRepository,
            LeaveBalanceService balanceService
    ) {
        this.approvalRepository = approvalRepository;
        this.requestRepository = requestRepository;
        this.balanceService = balanceService;
    }

    public List<LeaveApprovalResponse> getInbox(UUID approverId, String status) {
        String queryStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "PENDING";
        return approvalRepository.findByApproverIdAndStatusOrderByCreatedAtDesc(approverId, queryStatus).stream()
                .map(LeaveApprovalResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public LeaveRequestResponse approve(UUID approvalId, String comments) {
        LeaveApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveApproval", approvalId));

        if (!"PENDING".equalsIgnoreCase(approval.getStatus())) {
            throw new DomainException("INVALID_STATE", "Approval step is already " + approval.getStatus());
        }

        approval.setStatus("APPROVED");
        approval.setComments(comments);
        approval.setActionedAt(Instant.now());
        approvalRepository.save(approval);

        LeaveRequest request = approval.getLeaveRequest();
        List<LeaveApproval> allApprovals = approvalRepository.findByLeaveRequestIdOrderByStepOrderAsc(request.getId());

        boolean anyPending = allApprovals.stream().anyMatch(a -> "PENDING".equalsIgnoreCase(a.getStatus()));
        if (!anyPending) {
            request.setStatus("APPROVED");
            requestRepository.save(request);

            if (Boolean.TRUE.equals(request.getLeaveType().getIsPaid())) {
                balanceService.finalizeApproval(
                        request.getEmployee().getId(),
                        request.getLeaveType().getId(),
                        request.getTotalDays(),
                        request.getStartDate().getYear()
                );
            }
        }

        return LeaveRequestResponse.fromEntity(request);
    }

    public LeaveRequestResponse reject(UUID approvalId, String comments) {
        LeaveApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveApproval", approvalId));

        if (!"PENDING".equalsIgnoreCase(approval.getStatus())) {
            throw new DomainException("INVALID_STATE", "Approval step is already " + approval.getStatus());
        }

        approval.setStatus("REJECTED");
        approval.setComments(comments);
        approval.setActionedAt(Instant.now());
        approvalRepository.save(approval);

        LeaveRequest request = approval.getLeaveRequest();
        request.setStatus("REJECTED");
        requestRepository.save(request);

        if (Boolean.TRUE.equals(request.getLeaveType().getIsPaid())) {
            balanceService.restorePending(
                    request.getEmployee().getId(),
                    request.getLeaveType().getId(),
                    request.getTotalDays(),
                    request.getStartDate().getYear()
            );
        }

        List<LeaveApproval> allApprovals = approvalRepository.findByLeaveRequestIdOrderByStepOrderAsc(request.getId());
        for (LeaveApproval other : allApprovals) {
            if ("PENDING".equalsIgnoreCase(other.getStatus())) {
                other.setStatus("CANCELLED");
                approvalRepository.save(other);
            }
        }

        return LeaveRequestResponse.fromEntity(request);
    }
}
