package com.ventura.hris.organization.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.organization.dto.CreateDepartmentRequest;
import com.ventura.hris.organization.dto.DepartmentResponse;
import com.ventura.hris.organization.dto.UpdateDepartmentRequest;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.OrganizationUnit;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.DivisionRepository;
import com.ventura.hris.organization.repository.OrganizationUnitRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;
    private final DivisionRepository divisionRepository;
    private final PositionRepository positionRepository;
    private final OrganizationUnitRepository organizationUnitRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            CompanyRepository companyRepository,
            DivisionRepository divisionRepository,
            PositionRepository positionRepository,
            OrganizationUnitRepository organizationUnitRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.companyRepository = companyRepository;
        this.divisionRepository = divisionRepository;
        this.positionRepository = positionRepository;
        this.organizationUnitRepository = organizationUnitRepository;
    }

    @Transactional(readOnly = true)
    public Page<DepartmentResponse> list(String search, UUID companyId, String status, Pageable pageable) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        String normalizedStatus = StringUtils.hasText(status) ? status.trim().toUpperCase() : null;
        return departmentRepository.search(normalizedSearch, companyId, normalizedStatus, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DepartmentResponse get(UUID id) {
        return toResponse(getDepartment(id));
    }

    @Transactional
    public DepartmentResponse create(CreateDepartmentRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company"));

        String code = request.code().trim();
        if (departmentRepository.existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(company.getId(), code)) {
            throw new DomainException("DEPARTMENT_CODE_DUPLICATE", "Department code already exists for this company", HttpStatus.CONFLICT);
        }

        String status = StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE";

        Department department = new Department(
                company,
                code,
                request.name().trim(),
                request.description() != null ? request.description().trim() : null,
                status
        );

        Department savedDepartment = departmentRepository.save(department);

        // Auto-sync into organization unit hierarchy
        OrganizationUnit parentUnit = null;
        if (request.parentUnitId() != null) {
            parentUnit = organizationUnitRepository.findByIdAndDeletedFalse(request.parentUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent OrganizationUnit"));
            if (!parentUnit.getCompany().getId().equals(company.getId())) {
                throw new DomainException("INVALID_PARENT_UNIT", "Parent organization unit belongs to another company", HttpStatus.BAD_REQUEST);
            }
        }

        OrganizationUnit unit = new OrganizationUnit(
                company,
                parentUnit,
                savedDepartment,
                null,
                null,
                savedDepartment.getCode(),
                savedDepartment.getName(),
                "DEPARTMENT",
                savedDepartment.getStatus()
        );
        organizationUnitRepository.save(unit);

        return toResponse(savedDepartment);
    }

    @Transactional
    public DepartmentResponse update(UUID id, UpdateDepartmentRequest request) {
        Department department = getDepartment(id);

        department.setName(request.name().trim());
        department.setDescription(request.description() != null ? request.description().trim() : null);
        if (StringUtils.hasText(request.status())) {
            department.setStatus(request.status().trim().toUpperCase());
        }

        // Sync to organization unit if present
        organizationUnitRepository.findByDepartment_IdAndDeletedFalse(department.getId())
                .ifPresent(unit -> {
                    unit.setName(department.getName());
                    unit.setStatus(department.getStatus());
                });

        return toResponse(department);
    }

    @Transactional
    public void delete(UUID id) {
        Department department = getDepartment(id);

        if (divisionRepository.existsByDepartment_IdAndDeletedFalse(id)) {
            throw new DomainException("DEPT_HAS_DIVISIONS", "Cannot delete department with existing divisions", HttpStatus.BAD_REQUEST);
        }
        if (positionRepository.existsByDepartment_IdAndDeletedFalse(id)) {
            throw new DomainException("DEPT_HAS_POSITIONS", "Cannot delete department with existing positions", HttpStatus.BAD_REQUEST);
        }

        organizationUnitRepository.findByDepartment_IdAndDeletedFalse(id)
                .ifPresent(unit -> {
                    if (organizationUnitRepository.existsByParentUnit_IdAndDeletedFalse(unit.getId())) {
                        throw new DomainException("UNIT_HAS_CHILDREN", "Cannot delete department whose unit has child units", HttpStatus.BAD_REQUEST);
                    }
                    unit.setDeleted(true);
                });

        department.setDeleted(true);
    }

    public Department getDepartment(UUID id) {
        return departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department"));
    }

    private DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getCompany().getId(),
                department.getCompany().getCode(),
                department.getCode(),
                department.getName(),
                department.getDescription(),
                department.getStatus(),
                department.getCreatedAt(),
                department.getUpdatedAt(),
                department.getVersion()
        );
    }
}
