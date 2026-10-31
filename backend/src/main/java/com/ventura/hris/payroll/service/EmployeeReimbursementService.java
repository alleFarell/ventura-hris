package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.EmployeeReimbursementCreateRequest;
import com.ventura.hris.payroll.dto.EmployeeReimbursementResponse;
import com.ventura.hris.payroll.entity.EmployeeReimbursement;
import com.ventura.hris.payroll.repository.EmployeeReimbursementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class EmployeeReimbursementService {

    private final EmployeeReimbursementRepository reimbursementRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeReimbursementService(EmployeeReimbursementRepository reimbursementRepository,
                                        EmployeeRepository employeeRepository) {
        this.reimbursementRepository = reimbursementRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeReimbursementResponse submitReimbursement(EmployeeReimbursementCreateRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));

        String claimNumber = "CLM-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        EmployeeReimbursement claim = new EmployeeReimbursement();
        claim.setEmployee(employee);
        claim.setClaimNumber(claimNumber);
        claim.setTitle(request.title());
        claim.setClaimType(request.claimType());
        claim.setAmount(request.amount());
        claim.setReceiptUrl(request.receiptUrl());
        claim.setStatus("SUBMITTED");

        EmployeeReimbursement saved = reimbursementRepository.save(claim);
        return mapToResponse(saved);
    }

    public EmployeeReimbursementResponse approveReimbursement(UUID id, String approvedBy) {
        EmployeeReimbursement claim = reimbursementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reimbursement claim not found with id: " + id));

        claim.setStatus("APPROVED");
        claim.setApprovedBy(approvedBy != null ? approvedBy : "HR Admin");
        claim.setApprovedAt(Instant.now());

        return mapToResponse(reimbursementRepository.save(claim));
    }

    public EmployeeReimbursementResponse rejectReimbursement(UUID id, String rejectedBy) {
        EmployeeReimbursement claim = reimbursementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reimbursement claim not found with id: " + id));

        claim.setStatus("REJECTED");
        claim.setApprovedBy(rejectedBy != null ? rejectedBy : "HR Admin");
        claim.setApprovedAt(Instant.now());

        return mapToResponse(reimbursementRepository.save(claim));
    }

    @Transactional(readOnly = true)
    public List<EmployeeReimbursementResponse> getAllReimbursements(UUID employeeId, String status) {
        List<EmployeeReimbursement> claims;
        if (employeeId != null && status != null) {
            claims = reimbursementRepository.findByEmployeeIdAndStatus(employeeId, status);
        } else if (employeeId != null) {
            claims = reimbursementRepository.findByEmployeeId(employeeId);
        } else if (status != null) {
            claims = reimbursementRepository.findByStatus(status);
        } else {
            claims = reimbursementRepository.findAll();
        }
        return claims.stream().map(this::mapToResponse).toList();
    }

    private EmployeeReimbursementResponse mapToResponse(EmployeeReimbursement claim) {
        return new EmployeeReimbursementResponse(
                claim.getId(),
                claim.getEmployee().getId(),
                claim.getEmployee().getFirstName() + " " + (claim.getEmployee().getLastName() != null ? claim.getEmployee().getLastName() : ""),
                claim.getEmployee().getEmployeeNumber(),
                claim.getPayrollRun() != null ? claim.getPayrollRun().getId() : null,
                claim.getClaimNumber(),
                claim.getTitle(),
                claim.getClaimType(),
                claim.getAmount(),
                claim.getReceiptUrl(),
                claim.getStatus(),
                claim.getApprovedBy(),
                claim.getApprovedAt(),
                claim.getCreatedAt()
        );
    }
}
