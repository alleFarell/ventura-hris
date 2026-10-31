package com.ventura.hris.performance.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.performance.dto.AppraisalManagerReviewRequest;
import com.ventura.hris.performance.dto.AppraisalSelfReviewRequest;
import com.ventura.hris.performance.dto.EmployeeAppraisalRequest;
import com.ventura.hris.performance.dto.EmployeeAppraisalResponse;
import com.ventura.hris.performance.entity.EmployeeAppraisal;
import com.ventura.hris.performance.entity.PerformanceCycle;
import com.ventura.hris.performance.repository.EmployeeAppraisalRepository;
import com.ventura.hris.performance.repository.PerformanceCycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeAppraisalService {

    private final EmployeeAppraisalRepository appraisalRepository;
    private final PerformanceCycleRepository cycleRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeAppraisalService(EmployeeAppraisalRepository appraisalRepository,
                                    PerformanceCycleRepository cycleRepository,
                                    EmployeeRepository employeeRepository) {
        this.appraisalRepository = appraisalRepository;
        this.cycleRepository = cycleRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeAppraisalResponse initiateAppraisal(EmployeeAppraisalRequest request) {
        PerformanceCycle cycle = cycleRepository.findById(request.cycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Performance cycle not found: " + request.cycleId()));

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.employeeId()));

        if (appraisalRepository.findByCycleIdAndEmployeeId(cycle.getId(), employee.getId()).isPresent()) {
            throw new DomainException("DUPLICATE_APPRAISAL", "Appraisal already exists for this employee in the cycle");
        }

        Employee manager = null;
        if (request.managerId() != null) {
            manager = employeeRepository.findById(request.managerId()).orElse(null);
        }

        EmployeeAppraisal appraisal = new EmployeeAppraisal();
        appraisal.setCycle(cycle);
        appraisal.setEmployee(employee);
        appraisal.setManager(manager);
        appraisal.setStatus("SELF_REVIEW");

        EmployeeAppraisal saved = appraisalRepository.save(appraisal);
        return mapToResponse(saved);
    }

    public List<EmployeeAppraisalResponse> getAppraisals(UUID cycleId, UUID employeeId, String status) {
        List<EmployeeAppraisal> list;
        if (cycleId != null && employeeId != null) {
            list = appraisalRepository.findByCycleIdAndEmployeeId(cycleId, employeeId).map(List::of).orElse(List.of());
        } else if (cycleId != null) {
            list = appraisalRepository.findByCycleId(cycleId);
        } else if (employeeId != null) {
            list = appraisalRepository.findByEmployeeId(employeeId);
        } else {
            list = appraisalRepository.findAll();
        }

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = list.stream().filter(a -> status.equalsIgnoreCase(a.getStatus())).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EmployeeAppraisalResponse getAppraisal(UUID id) {
        EmployeeAppraisal appraisal = appraisalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee appraisal not found: " + id));
        return mapToResponse(appraisal);
    }

    public EmployeeAppraisalResponse submitSelfReview(UUID id, AppraisalSelfReviewRequest request) {
        EmployeeAppraisal appraisal = appraisalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee appraisal not found: " + id));

        if (!"SELF_REVIEW".equalsIgnoreCase(appraisal.getStatus())) {
            throw new DomainException("INVALID_STATUS_TRANSITION", "Self review can only be submitted during SELF_REVIEW stage");
        }

        appraisal.setSelfScore(request.selfScore());
        appraisal.setSelfComments(request.selfComments());
        appraisal.setStatus("MANAGER_REVIEW");

        EmployeeAppraisal saved = appraisalRepository.save(appraisal);
        return mapToResponse(saved);
    }

    public EmployeeAppraisalResponse submitManagerReview(UUID id, AppraisalManagerReviewRequest request) {
        EmployeeAppraisal appraisal = appraisalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee appraisal not found: " + id));

        if (!"MANAGER_REVIEW".equalsIgnoreCase(appraisal.getStatus())) {
            throw new DomainException("INVALID_STATUS_TRANSITION", "Manager review can only be submitted during MANAGER_REVIEW stage");
        }

        appraisal.setManagerScore(request.managerScore());
        appraisal.setManagerComments(request.managerComments());

        // Calculate final score: 30% self + 70% manager
        BigDecimal selfWeight = new BigDecimal("0.30");
        BigDecimal managerWeight = new BigDecimal("0.70");
        BigDecimal self = appraisal.getSelfScore() != null ? appraisal.getSelfScore() : request.managerScore();
        BigDecimal finalScore = self.multiply(selfWeight).add(request.managerScore().multiply(managerWeight))
                .setScale(2, RoundingMode.HALF_UP);
        appraisal.setFinalScore(finalScore);

        // Determine grade
        if (finalScore.compareTo(new BigDecimal("4.50")) >= 0) {
            appraisal.setPerformanceGrade("A");
        } else if (finalScore.compareTo(new BigDecimal("3.50")) >= 0) {
            appraisal.setPerformanceGrade("B");
        } else if (finalScore.compareTo(new BigDecimal("2.50")) >= 0) {
            appraisal.setPerformanceGrade("C");
        } else {
            appraisal.setPerformanceGrade("D");
        }

        appraisal.setStatus("COMPLETED");
        EmployeeAppraisal saved = appraisalRepository.save(appraisal);
        return mapToResponse(saved);
    }

    private EmployeeAppraisalResponse mapToResponse(EmployeeAppraisal a) {
        String empNum = a.getEmployee() != null ? a.getEmployee().getEmployeeNumber() : "";
        String empName = a.getEmployee() != null
                ? a.getEmployee().getFirstName() + " " + (a.getEmployee().getLastName() != null ? a.getEmployee().getLastName() : "")
                : "";
        String mgrName = a.getManager() != null
                ? a.getManager().getFirstName() + " " + (a.getManager().getLastName() != null ? a.getManager().getLastName() : "")
                : null;

        return new EmployeeAppraisalResponse(
                a.getId(),
                a.getCycle() != null ? a.getCycle().getId() : null,
                a.getCycle() != null ? a.getCycle().getName() : "",
                a.getEmployee() != null ? a.getEmployee().getId() : null,
                empNum,
                empName.trim(),
                a.getManager() != null ? a.getManager().getId() : null,
                mgrName != null ? mgrName.trim() : null,
                a.getSelfScore(),
                a.getManagerScore(),
                a.getFinalScore(),
                a.getPerformanceGrade(),
                a.getStatus(),
                a.getSelfComments(),
                a.getManagerComments(),
                a.getCreatedAt()
        );
    }
}
