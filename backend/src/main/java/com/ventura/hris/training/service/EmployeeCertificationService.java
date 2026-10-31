package com.ventura.hris.training.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.training.dto.EmployeeCertificationRequest;
import com.ventura.hris.training.dto.EmployeeCertificationResponse;
import com.ventura.hris.training.entity.EmployeeCertification;
import com.ventura.hris.training.repository.EmployeeCertificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeCertificationService {

    private final EmployeeCertificationRepository certificationRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeCertificationService(EmployeeCertificationRepository certificationRepository,
                                        EmployeeRepository employeeRepository) {
        this.certificationRepository = certificationRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeCertificationResponse createCertification(EmployeeCertificationRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.employeeId()));

        EmployeeCertification cert = new EmployeeCertification();
        cert.setEmployee(employee);
        cert.setCertificationName(request.certificationName().trim());
        cert.setIssuingOrganization(request.issuingOrganization().trim());
        cert.setCredentialId(request.credentialId());
        cert.setIssueDate(request.issueDate());
        cert.setExpirationDate(request.expirationDate());
        cert.setVerificationUrl(request.verificationUrl());

        EmployeeCertification saved = certificationRepository.save(cert);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EmployeeCertificationResponse> getCertifications(UUID employeeId) {
        List<EmployeeCertification> list;
        if (employeeId != null) {
            list = certificationRepository.findByEmployeeId(employeeId);
        } else {
            list = certificationRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeCertificationResponse getCertificationById(UUID id) {
        EmployeeCertification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found: " + id));
        return mapToResponse(cert);
    }

    public void deleteCertification(UUID id) {
        if (!certificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Certification not found: " + id);
        }
        certificationRepository.deleteById(id);
    }

    private EmployeeCertificationResponse mapToResponse(EmployeeCertification c) {
        String employeeName = "";
        String employeeNumber = "";
        if (c.getEmployee() != null) {
            employeeName = c.getEmployee().getFirstName() + " " + (c.getEmployee().getLastName() != null ? c.getEmployee().getLastName() : "");
            employeeNumber = c.getEmployee().getEmployeeNumber();
        }

        boolean isExpired = c.getExpirationDate() != null && c.getExpirationDate().isBefore(LocalDate.now());

        return new EmployeeCertificationResponse(
                c.getId(),
                c.getEmployee() != null ? c.getEmployee().getId() : null,
                employeeName.trim(),
                employeeNumber,
                c.getCertificationName(),
                c.getIssuingOrganization(),
                c.getCredentialId(),
                c.getIssueDate(),
                c.getExpirationDate(),
                c.getVerificationUrl(),
                isExpired,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
