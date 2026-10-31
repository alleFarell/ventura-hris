package com.ventura.hris.offboarding.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.offboarding.dto.ExitInterviewRequest;
import com.ventura.hris.offboarding.dto.ExitInterviewResponse;
import com.ventura.hris.offboarding.entity.ExitInterview;
import com.ventura.hris.offboarding.entity.OffboardingCase;
import com.ventura.hris.offboarding.repository.ExitInterviewRepository;
import com.ventura.hris.offboarding.repository.OffboardingCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class ExitInterviewService {

    private final ExitInterviewRepository exitInterviewRepository;
    private final OffboardingCaseRepository caseRepository;
    private final EmployeeRepository employeeRepository;

    public ExitInterviewService(ExitInterviewRepository exitInterviewRepository,
                                OffboardingCaseRepository caseRepository,
                                EmployeeRepository employeeRepository) {
        this.exitInterviewRepository = exitInterviewRepository;
        this.caseRepository = caseRepository;
        this.employeeRepository = employeeRepository;
    }

    public ExitInterviewResponse submitExitInterview(ExitInterviewRequest request) {
        OffboardingCase offCase = caseRepository.findById(request.caseId())
                .orElseThrow(() -> new ResourceNotFoundException("Offboarding case not found: " + request.caseId()));

        if (exitInterviewRepository.findByOffboardingCaseId(offCase.getId()).isPresent()) {
            throw new DomainException("INTERVIEW_ALREADY_EXISTS", "An exit interview has already been submitted for this offboarding case");
        }

        Employee interviewer = null;
        if (request.interviewerId() != null) {
            interviewer = employeeRepository.findById(request.interviewerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found: " + request.interviewerId()));
        }

        ExitInterview exitInterview = new ExitInterview();
        exitInterview.setOffboardingCase(offCase);
        exitInterview.setInterviewer(interviewer);
        exitInterview.setPrimaryReason(request.primaryReason().trim());
        exitInterview.setCultureRating(request.cultureRating());
        exitInterview.setManagementRating(request.managementRating());
        exitInterview.setFeedbackText(request.feedbackText());

        ExitInterview saved = exitInterviewRepository.save(exitInterview);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ExitInterviewResponse getExitInterviewByCaseId(UUID caseId) {
        ExitInterview interview = exitInterviewRepository.findByOffboardingCaseId(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exit interview not found for case: " + caseId));
        return mapToResponse(interview);
    }

    private ExitInterviewResponse mapToResponse(ExitInterview i) {
        String empName = "";
        String empNumber = "";
        if (i.getOffboardingCase() != null && i.getOffboardingCase().getEmployee() != null) {
            Employee e = i.getOffboardingCase().getEmployee();
            empName = e.getFirstName() + " " + (e.getLastName() != null ? e.getLastName() : "");
            empName = empName.trim();
            empNumber = e.getEmployeeNumber();
        }

        String interviewerName = "";
        if (i.getInterviewer() != null) {
            interviewerName = i.getInterviewer().getFirstName() + " " + (i.getInterviewer().getLastName() != null ? i.getInterviewer().getLastName() : "");
            interviewerName = interviewerName.trim();
        }

        return new ExitInterviewResponse(
                i.getId(),
                i.getOffboardingCase() != null ? i.getOffboardingCase().getId() : null,
                empName,
                empNumber,
                i.getInterviewer() != null ? i.getInterviewer().getId() : null,
                interviewerName,
                i.getPrimaryReason(),
                i.getCultureRating(),
                i.getManagementRating(),
                i.getFeedbackText(),
                i.getSubmittedAt()
        );
    }
}
