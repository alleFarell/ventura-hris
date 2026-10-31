package com.ventura.hris.offboarding.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.offboarding.dto.OffboardingCaseRequest;
import com.ventura.hris.offboarding.dto.OffboardingCaseResponse;
import com.ventura.hris.offboarding.entity.OffboardingCase;
import com.ventura.hris.offboarding.entity.OffboardingChecklist;
import com.ventura.hris.offboarding.repository.OffboardingCaseRepository;
import com.ventura.hris.offboarding.repository.OffboardingChecklistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OffboardingCaseService {

    private final OffboardingCaseRepository caseRepository;
    private final OffboardingChecklistRepository checklistRepository;
    private final EmployeeRepository employeeRepository;

    private static final List<String[]> DEFAULT_CHECKLIST_ITEMS = List.of(
            new String[]{"IT", "Revoke Corporate Email & Single Sign-On Access"},
            new String[]{"IT", "Disable VPN and Internal System Credentials"},
            new String[]{"ASSETS", "Return Laptop, Charger & Peripheral Accessories"},
            new String[]{"ASSETS", "Return Security Access Card & Office Keys"},
            new String[]{"FINANCE", "Final Salary & Expense Reimbursement Settlement"},
            new String[]{"FINANCE", "Outstanding Employee Loan Clearance"},
            new String[]{"HR", "Complete Exit Interview Survey"},
            new String[]{"HR", "Provide Work Certificate (Surat Pengalaman Kerja)"}
    );

    public OffboardingCaseService(OffboardingCaseRepository caseRepository,
                                  OffboardingChecklistRepository checklistRepository,
                                  EmployeeRepository employeeRepository) {
        this.caseRepository = caseRepository;
        this.checklistRepository = checklistRepository;
        this.employeeRepository = employeeRepository;
    }

    public OffboardingCaseResponse createCase(OffboardingCaseRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.employeeId()));

        List<OffboardingCase> activeCases = caseRepository.findByEmployeeId(employee.getId()).stream()
                .filter(c -> "SUBMITTED".equals(c.getStatus()) || "IN_CLEARANCE".equals(c.getStatus()))
                .collect(Collectors.toList());

        if (!activeCases.isEmpty()) {
            throw new DomainException("ACTIVE_CASE_EXISTS", "Employee already has an active offboarding case in progress");
        }

        OffboardingCase offboardingCase = new OffboardingCase();
        offboardingCase.setEmployee(employee);
        offboardingCase.setSeparationType(request.separationType().trim().toUpperCase());
        offboardingCase.setNoticeDate(request.noticeDate());
        offboardingCase.setLastWorkingDate(request.lastWorkingDate());
        offboardingCase.setReason(request.reason());
        offboardingCase.setStatus("IN_CLEARANCE");

        OffboardingCase saved = caseRepository.save(offboardingCase);

        // Auto-seed standard checklist tasks
        for (String[] itemDef : DEFAULT_CHECKLIST_ITEMS) {
            OffboardingChecklist item = new OffboardingChecklist();
            item.setOffboardingCase(saved);
            item.setDepartmentName(itemDef[0]);
            item.setItemName(itemDef[1]);
            item.setIsCleared(false);
            checklistRepository.save(item);
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OffboardingCaseResponse> getCases(UUID employeeId, String status) {
        List<OffboardingCase> list;
        if (employeeId != null) {
            list = caseRepository.findByEmployeeId(employeeId);
        } else if (status != null && !status.isBlank()) {
            list = caseRepository.findByStatus(status.trim().toUpperCase());
        } else {
            list = caseRepository.findAll();
        }

        if (status != null && !status.isBlank() && employeeId != null) {
            list = list.stream().filter(c -> status.equalsIgnoreCase(c.getStatus())).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OffboardingCaseResponse getCaseById(UUID id) {
        OffboardingCase offboardingCase = caseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding case not found: " + id));
        return mapToResponse(offboardingCase);
    }

    public OffboardingCaseResponse cancelCase(UUID id) {
        OffboardingCase offboardingCase = caseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding case not found: " + id));
        offboardingCase.setStatus("CANCELLED");
        return mapToResponse(caseRepository.save(offboardingCase));
    }

    public OffboardingCaseResponse mapToResponse(OffboardingCase c) {
        String empName = "";
        String empNumber = "";
        String deptName = "";
        String posName = "";

        if (c.getEmployee() != null) {
            empName = c.getEmployee().getFirstName() + " " + (c.getEmployee().getLastName() != null ? c.getEmployee().getLastName() : "");
            empName = empName.trim();
            empNumber = c.getEmployee().getEmployeeNumber();
            if (c.getEmployee().getDepartment() != null) {
                deptName = c.getEmployee().getDepartment().getName();
            }
            if (c.getEmployee().getPosition() != null) {
                posName = c.getEmployee().getPosition().getName();
            }
        }

        List<OffboardingChecklist> items = checklistRepository.findByOffboardingCaseId(c.getId());
        long totalItems = items.size();
        long clearedItems = items.stream().filter(OffboardingChecklist::getIsCleared).count();

        return new OffboardingCaseResponse(
                c.getId(),
                c.getEmployee() != null ? c.getEmployee().getId() : null,
                empName,
                empNumber,
                deptName,
                posName,
                c.getSeparationType(),
                c.getNoticeDate(),
                c.getLastWorkingDate(),
                c.getReason(),
                c.getStatus(),
                clearedItems,
                totalItems,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
