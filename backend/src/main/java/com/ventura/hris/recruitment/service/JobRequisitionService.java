package com.ventura.hris.recruitment.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.recruitment.dto.JobRequisitionRequest;
import com.ventura.hris.recruitment.dto.JobRequisitionResponse;
import com.ventura.hris.recruitment.entity.JobRequisition;
import com.ventura.hris.recruitment.repository.JobRequisitionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobRequisitionService {

    private final JobRequisitionRepository requisitionRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;

    public JobRequisitionService(JobRequisitionRepository requisitionRepository,
                                 DepartmentRepository departmentRepository,
                                 PositionRepository positionRepository,
                                 EmployeeRepository employeeRepository) {
        this.requisitionRepository = requisitionRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.employeeRepository = employeeRepository;
    }

    public JobRequisitionResponse createRequisition(JobRequisitionRequest request) {
        Department department = null;
        if (request.departmentId() != null) {
            department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + request.departmentId()));
        }

        Position position = null;
        if (request.positionId() != null) {
            position = positionRepository.findById(request.positionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Position not found: " + request.positionId()));
        }

        Employee requester = null;
        if (request.requestedBy() != null) {
            requester = employeeRepository.findById(request.requestedBy()).orElse(null);
        }

        String reqNum = "REQ-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        JobRequisition req = new JobRequisition();
        req.setRequisitionNumber(reqNum);
        req.setTitle(request.title());
        req.setDepartment(department);
        req.setPosition(position);
        req.setHeadcount(request.headcount() != null ? request.headcount() : 1);
        if (request.employmentType() != null) req.setEmploymentType(request.employmentType());
        req.setMinSalary(request.minSalary());
        req.setMaxSalary(request.maxSalary());
        req.setJustification(request.justification());
        req.setStatus("DRAFT");
        req.setRequestedBy(requester);

        JobRequisition saved = requisitionRepository.save(req);
        return mapToResponse(saved);
    }

    public JobRequisitionResponse submitRequisition(UUID id) {
        JobRequisition req = requisitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requisition not found: " + id));

        if (!"DRAFT".equals(req.getStatus())) {
            throw new DomainException("INVALID_STATE", "Only DRAFT requisitions can be submitted for approval");
        }

        req.setStatus("PENDING_APPROVAL");
        return mapToResponse(requisitionRepository.save(req));
    }

    public JobRequisitionResponse approveRequisition(UUID id, UUID approverId) {
        JobRequisition req = requisitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requisition not found: " + id));

        if (!"PENDING_APPROVAL".equals(req.getStatus()) && !"DRAFT".equals(req.getStatus())) {
            throw new DomainException("INVALID_STATE", "Requisition cannot be approved in current state: " + req.getStatus());
        }

        req.setStatus("APPROVED");
        if (approverId != null) {
            employeeRepository.findById(approverId).ifPresent(req::setApprovedBy);
        }
        req.setApprovedAt(Instant.now());
        return mapToResponse(requisitionRepository.save(req));
    }

    public List<JobRequisitionResponse> getRequisitions(String status, UUID departmentId) {
        List<JobRequisition> list;
        if (departmentId != null) {
            list = requisitionRepository.findByDepartmentId(departmentId);
        } else if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = requisitionRepository.findByStatus(status);
        } else {
            list = requisitionRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public JobRequisitionResponse getRequisition(UUID id) {
        JobRequisition req = requisitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requisition not found: " + id));
        return mapToResponse(req);
    }

    private JobRequisitionResponse mapToResponse(JobRequisition r) {
        String reqByName = r.getRequestedBy() != null ? r.getRequestedBy().getFirstName() + " " + (r.getRequestedBy().getLastName() != null ? r.getRequestedBy().getLastName() : "") : null;
        String appByName = r.getApprovedBy() != null ? r.getApprovedBy().getFirstName() + " " + (r.getApprovedBy().getLastName() != null ? r.getApprovedBy().getLastName() : "") : null;

        return new JobRequisitionResponse(
                r.getId(),
                r.getRequisitionNumber(),
                r.getTitle(),
                r.getDepartment() != null ? r.getDepartment().getId() : null,
                r.getDepartment() != null ? r.getDepartment().getName() : null,
                r.getPosition() != null ? r.getPosition().getId() : null,
                r.getPosition() != null ? r.getPosition().getName() : null,
                r.getHeadcount(),
                r.getEmploymentType(),
                r.getMinSalary(),
                r.getMaxSalary(),
                r.getJustification(),
                r.getStatus(),
                r.getRequestedBy() != null ? r.getRequestedBy().getId() : null,
                reqByName != null ? reqByName.trim() : null,
                r.getApprovedBy() != null ? r.getApprovedBy().getId() : null,
                appByName != null ? appByName.trim() : null,
                r.getApprovedAt(),
                r.getCreatedAt()
        );
    }
}
