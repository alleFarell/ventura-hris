package com.ventura.hris.leave.service;

import com.ventura.hris.attendance.entity.CompanyHoliday;
import com.ventura.hris.attendance.repository.CompanyHolidayRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.leave.dto.LeaveRequestCreateRequest;
import com.ventura.hris.leave.dto.LeaveRequestResponse;
import com.ventura.hris.leave.entity.LeaveApproval;
import com.ventura.hris.leave.entity.LeaveRequest;
import com.ventura.hris.leave.entity.LeaveType;
import com.ventura.hris.leave.repository.LeaveApprovalRepository;
import com.ventura.hris.leave.repository.LeaveRequestRepository;
import com.ventura.hris.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveRequestService {

    private final LeaveRequestRepository requestRepository;
    private final LeaveApprovalRepository approvalRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyHolidayRepository holidayRepository;
    private final LeaveBalanceService balanceService;

    public LeaveRequestService(
            LeaveRequestRepository requestRepository,
            LeaveApprovalRepository approvalRepository,
            LeaveTypeRepository leaveTypeRepository,
            EmployeeRepository employeeRepository,
            CompanyHolidayRepository holidayRepository,
            LeaveBalanceService balanceService
    ) {
        this.requestRepository = requestRepository;
        this.approvalRepository = approvalRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.employeeRepository = employeeRepository;
        this.holidayRepository = holidayRepository;
        this.balanceService = balanceService;
    }

    public int calculateWorkingDays(LocalDate startDate, LocalDate endDate, UUID companyId) {
        if (startDate.isAfter(endDate)) {
            throw new DomainException("INVALID_DATE_RANGE", "Start date cannot be after end date");
        }

        List<CompanyHoliday> holidays = holidayRepository.findByHolidayDateBetweenOrderByHolidayDateAsc(startDate, endDate);
        Set<LocalDate> holidayDates = holidays.stream()
                .filter(h -> companyId == null || h.getCompanyId() == null || h.getCompanyId().equals(companyId))
                .map(CompanyHoliday::getHolidayDate)
                .collect(Collectors.toSet());

        int workingDays = 0;
        LocalDate curr = startDate;
        while (!curr.isAfter(endDate)) {
            DayOfWeek dow = curr.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY && !holidayDates.contains(curr)) {
                workingDays++;
            }
            curr = curr.plusDays(1);
        }
        return workingDays;
    }

    public LeaveRequestResponse createLeaveRequest(LeaveRequestCreateRequest req) {
        if (req.getEmployeeId() == null) {
            throw new DomainException("REQUIRED_FIELD", "Employee ID is required");
        }

        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", req.getEmployeeId()));

        LeaveType leaveType = leaveTypeRepository.findById(req.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", req.getLeaveTypeId()));

        if (Boolean.FALSE.equals(leaveType.getIsActive())) {
            throw new DomainException("INACTIVE_LEAVE_TYPE", "Leave type " + leaveType.getName() + " is currently inactive");
        }

        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new DomainException("INVALID_DATE_RANGE", "Start date cannot be after end date");
        }

        UUID companyId = employee.getCompany() != null ? employee.getCompany().getId() : null;
        int workingDays = calculateWorkingDays(req.getStartDate(), req.getEndDate(), companyId);

        if (workingDays <= 0) {
            throw new DomainException("NO_WORKING_DAYS", "Selected date range contains no working days (weekends or public holidays only)");
        }

        if (leaveType.getMaxConsecutiveDays() != null && workingDays > leaveType.getMaxConsecutiveDays()) {
            throw new DomainException("EXCEEDS_MAX_DAYS", String.format(
                    "Requested leave duration of %d days exceeds maximum consecutive allowed of %d days",
                    workingDays, leaveType.getMaxConsecutiveDays()
            ));
        }

        if (Boolean.TRUE.equals(leaveType.getRequiresAttachment()) && (req.getAttachmentUrl() == null || req.getAttachmentUrl().isBlank())) {
            throw new DomainException("ATTACHMENT_REQUIRED", "Document attachment is required for " + leaveType.getName());
        }

        List<LeaveRequest> overlapping = requestRepository.findOverlappingRequests(
                employee.getId(), req.getStartDate(), req.getEndDate(), List.of("PENDING", "APPROVED")
        );
        if (!overlapping.isEmpty()) {
            throw new DomainException("OVERLAPPING_LEAVE_REQUEST", "Employee already has a pending or approved leave request during this date range");
        }

        if (Boolean.TRUE.equals(leaveType.getIsPaid())) {
            balanceService.holdPending(employee.getId(), leaveType.getId(), workingDays, req.getStartDate().getYear());
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(req.getStartDate());
        leaveRequest.setEndDate(req.getEndDate());
        leaveRequest.setTotalDays(workingDays);
        leaveRequest.setReason(req.getReason().trim());
        leaveRequest.setAttachmentUrl(req.getAttachmentUrl());
        leaveRequest.setStatus("PENDING");

        LeaveRequest saved = requestRepository.save(leaveRequest);

        // Determine approver
        Employee approver = null;
        if (req.getApproverId() != null) {
            approver = employeeRepository.findById(req.getApproverId()).orElse(null);
        }

        if (approver == null) {
            // Find another active employee as approver (e.g. peer or manager)
            List<Employee> others = employeeRepository.findAll().stream()
                    .filter(e -> !e.getId().equals(employee.getId()))
                    .collect(Collectors.toList());
            if (!others.isEmpty()) {
                approver = others.get(0);
            }
        }

        if (approver != null) {
            LeaveApproval approval = new LeaveApproval();
            approval.setLeaveRequest(saved);
            approval.setApprover(approver);
            approval.setStepOrder(1);
            approval.setStatus("PENDING");
            approvalRepository.save(approval);
            saved.getApprovals().add(approval);
        }

        return LeaveRequestResponse.fromEntity(saved);
    }

    public LeaveRequestResponse cancelLeaveRequest(UUID requestId) {
        LeaveRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", requestId));

        if ("CANCELLED".equalsIgnoreCase(request.getStatus()) || "REJECTED".equalsIgnoreCase(request.getStatus())) {
            throw new DomainException("INVALID_STATE", "Cannot cancel a leave request with status " + request.getStatus());
        }

        if (Boolean.TRUE.equals(request.getLeaveType().getIsPaid())) {
            if ("PENDING".equalsIgnoreCase(request.getStatus())) {
                balanceService.restorePending(
                        request.getEmployee().getId(),
                        request.getLeaveType().getId(),
                        request.getTotalDays(),
                        request.getStartDate().getYear()
                );
            } else if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
                balanceService.restoreUsed(
                        request.getEmployee().getId(),
                        request.getLeaveType().getId(),
                        request.getTotalDays(),
                        request.getStartDate().getYear()
                );
            }
        }

        request.setStatus("CANCELLED");
        for (LeaveApproval app : request.getApprovals()) {
            if ("PENDING".equalsIgnoreCase(app.getStatus())) {
                app.setStatus("CANCELLED");
                approvalRepository.save(app);
            }
        }

        return LeaveRequestResponse.fromEntity(requestRepository.save(request));
    }

    public List<LeaveRequestResponse> getEmployeeRequests(UUID employeeId) {
        return requestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestResponse> getRequests(String status) {
        if (status != null && !status.isBlank()) {
            return requestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase()).stream()
                    .map(LeaveRequestResponse::fromEntity)
                    .collect(Collectors.toList());
        }
        return requestRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestResponse> getCalendarLeaves(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : start.plusMonths(1);
        return requestRepository.findApprovedInDateRange(start, end).stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public LeaveRequestResponse getRequestById(UUID id) {
        LeaveRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
        return LeaveRequestResponse.fromEntity(req);
    }
}
