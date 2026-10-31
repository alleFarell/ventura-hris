package com.ventura.hris.offboarding.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.offboarding.dto.ChecklistClearRequest;
import com.ventura.hris.offboarding.dto.OffboardingChecklistResponse;
import com.ventura.hris.offboarding.entity.OffboardingCase;
import com.ventura.hris.offboarding.entity.OffboardingChecklist;
import com.ventura.hris.offboarding.repository.OffboardingCaseRepository;
import com.ventura.hris.offboarding.repository.OffboardingChecklistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OffboardingChecklistService {

    private final OffboardingChecklistRepository checklistRepository;
    private final OffboardingCaseRepository caseRepository;
    private final EmployeeRepository employeeRepository;

    public OffboardingChecklistService(OffboardingChecklistRepository checklistRepository,
                                     OffboardingCaseRepository caseRepository,
                                     EmployeeRepository employeeRepository) {
        this.checklistRepository = checklistRepository;
        this.caseRepository = caseRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<OffboardingChecklistResponse> getChecklists(UUID caseId) {
        return checklistRepository.findByOffboardingCaseId(caseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OffboardingChecklistResponse clearItem(UUID itemId, ChecklistClearRequest request) {
        OffboardingChecklist item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found: " + itemId));

        item.setIsCleared(true);
        item.setClearedBy(request.clearedBy().trim());
        item.setClearedAt(Instant.now());
        if (request.notes() != null) {
            item.setNotes(request.notes().trim());
        }

        OffboardingChecklist saved = checklistRepository.save(item);

        // Check if all items for the case are completed
        OffboardingCase offCase = item.getOffboardingCase();
        if (offCase != null) {
            long remaining = checklistRepository.countByOffboardingCaseIdAndIsClearedFalse(offCase.getId());
            if (remaining == 0) {
                offCase.setStatus("COMPLETED");
                caseRepository.save(offCase);

                Employee employee = offCase.getEmployee();
                if (employee != null) {
                    employee.setEmploymentStatus(EmploymentStatus.TERMINATED);
                    employeeRepository.save(employee);
                }
            }
        }

        return mapToResponse(saved);
    }

    private OffboardingChecklistResponse mapToResponse(OffboardingChecklist i) {
        return new OffboardingChecklistResponse(
                i.getId(),
                i.getOffboardingCase() != null ? i.getOffboardingCase().getId() : null,
                i.getDepartmentName(),
                i.getItemName(),
                i.getIsCleared(),
                i.getClearedBy(),
                i.getClearedAt(),
                i.getNotes(),
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }
}
