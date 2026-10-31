package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.WfhRequestCreateRequest;
import com.ventura.hris.attendance.dto.WfhRequestResponse;
import com.ventura.hris.attendance.entity.WfhRequest;
import com.ventura.hris.attendance.repository.WfhRequestRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class WfhService {

    private final WfhRequestRepository wfhRequestRepository;
    private final EmployeeRepository employeeRepository;

    public WfhService(WfhRequestRepository wfhRequestRepository, EmployeeRepository employeeRepository) {
        this.wfhRequestRepository = wfhRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    public WfhRequestResponse createWfhRequest(WfhRequestCreateRequest req) {
        if (req.getEmployeeId() == null) {
            throw new DomainException("REQUIRED_FIELD", "Employee ID is required");
        }

        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", req.getEmployeeId()));

        if (wfhRequestRepository.findByEmployeeIdAndRequestDate(employee.getId(), req.getRequestDate()).isPresent()) {
            throw new DomainException("DUPLICATE_WFH_REQUEST", "WFH request already submitted for date: " + req.getRequestDate());
        }

        WfhRequest wfh = new WfhRequest();
        wfh.setEmployee(employee);
        wfh.setRequestDate(req.getRequestDate());
        wfh.setReason(req.getReason().trim());
        wfh.setStatus("PENDING");

        if (req.getApproverId() != null) {
            employeeRepository.findById(req.getApproverId()).ifPresent(wfh::setApprover);
        } else {
            List<Employee> others = employeeRepository.findAll().stream()
                    .filter(e -> !e.getId().equals(employee.getId()))
                    .collect(Collectors.toList());
            if (!others.isEmpty()) {
                wfh.setApprover(others.get(0));
            }
        }

        return WfhRequestResponse.fromEntity(wfhRequestRepository.save(wfh));
    }

    public WfhRequestResponse approveWfhRequest(UUID id, String comments) {
        WfhRequest request = wfhRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WfhRequest", id));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new DomainException("INVALID_STATE", "WFH request is already " + request.getStatus());
        }

        request.setStatus("APPROVED");
        request.setManagerComment(comments);
        request.setActionedAt(Instant.now());
        return WfhRequestResponse.fromEntity(wfhRequestRepository.save(request));
    }

    public WfhRequestResponse rejectWfhRequest(UUID id, String comments) {
        WfhRequest request = wfhRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WfhRequest", id));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new DomainException("INVALID_STATE", "WFH request is already " + request.getStatus());
        }

        request.setStatus("REJECTED");
        request.setManagerComment(comments);
        request.setActionedAt(Instant.now());
        return WfhRequestResponse.fromEntity(wfhRequestRepository.save(request));
    }

    public List<WfhRequestResponse> getEmployeeRequests(UUID employeeId) {
        return wfhRequestRepository.findByEmployeeIdOrderByRequestDateDesc(employeeId).stream()
                .map(WfhRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<WfhRequestResponse> getApproverInbox(UUID approverId, String status) {
        String queryStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "PENDING";
        return wfhRequestRepository.findByApproverIdAndStatusOrderByCreatedAtDesc(approverId, queryStatus).stream()
                .map(WfhRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public boolean isWfhApproved(UUID employeeId, LocalDate date) {
        return wfhRequestRepository.existsByEmployeeIdAndRequestDateAndStatus(employeeId, date, "APPROVED");
    }
}
