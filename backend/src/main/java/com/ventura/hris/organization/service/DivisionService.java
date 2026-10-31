package com.ventura.hris.organization.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.organization.dto.CreateDivisionRequest;
import com.ventura.hris.organization.dto.DivisionResponse;
import com.ventura.hris.organization.dto.UpdateDivisionRequest;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Division;
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
public class DivisionService {

    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;
    private final PositionRepository positionRepository;
    private final OrganizationUnitRepository organizationUnitRepository;

    public DivisionService(
            DivisionRepository divisionRepository,
            DepartmentRepository departmentRepository,
            CompanyRepository companyRepository,
            PositionRepository positionRepository,
            OrganizationUnitRepository organizationUnitRepository
    ) {
        this.divisionRepository = divisionRepository;
        this.departmentRepository = departmentRepository;
        this.companyRepository = companyRepository;
        this.positionRepository = positionRepository;
        this.organizationUnitRepository = organizationUnitRepository;
    }

    @Transactional(readOnly = true)
    public Page<DivisionResponse> list(String search, UUID companyId, UUID departmentId, String status, Pageable pageable) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        String normalizedStatus = StringUtils.hasText(status) ? status.trim().toUpperCase() : null;
        return divisionRepository.search(normalizedSearch, companyId, departmentId, normalizedStatus, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DivisionResponse get(UUID id) {
        return toResponse(getDivision(id));
    }

    @Transactional
    public DivisionResponse create(CreateDivisionRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company"));

        Department department = departmentRepository.findByIdAndDeletedFalse(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department"));

        if (!department.getCompany().getId().equals(company.getId())) {
            throw new DomainException("INVALID_DEPARTMENT", "Department does not belong to the specified company", HttpStatus.BAD_REQUEST);
        }

        String code = request.code().trim();
        if (divisionRepository.existsByDepartment_IdAndCodeIgnoreCaseAndDeletedFalse(department.getId(), code)) {
            throw new DomainException("DIVISION_CODE_DUPLICATE", "Division code already exists in this department", HttpStatus.CONFLICT);
        }

        String status = StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE";

        Division division = new Division(
                company,
                department,
                code,
                request.name().trim(),
                status
        );

        Division savedDivision = divisionRepository.save(division);

        // Auto-sync into organization unit hierarchy
        OrganizationUnit parentUnit = null;
        if (request.parentUnitId() != null) {
            parentUnit = organizationUnitRepository.findByIdAndDeletedFalse(request.parentUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent OrganizationUnit"));
        } else {
            // Default parent to department's organization unit if found
            parentUnit = organizationUnitRepository.findByDepartment_IdAndDeletedFalse(department.getId()).orElse(null);
        }

        OrganizationUnit unit = new OrganizationUnit(
                company,
                parentUnit,
                department,
                savedDivision,
                null,
                savedDivision.getCode(),
                savedDivision.getName(),
                "DIVISION",
                savedDivision.getStatus()
        );
        organizationUnitRepository.save(unit);

        return toResponse(savedDivision);
    }

    @Transactional
    public DivisionResponse update(UUID id, UpdateDivisionRequest request) {
        Division division = getDivision(id);

        division.setName(request.name().trim());
        if (StringUtils.hasText(request.status())) {
            division.setStatus(request.status().trim().toUpperCase());
        }

        organizationUnitRepository.findByDivision_IdAndDeletedFalse(division.getId())
                .ifPresent(unit -> {
                    unit.setName(division.getName());
                    unit.setStatus(division.getStatus());
                });

        return toResponse(division);
    }

    @Transactional
    public void delete(UUID id) {
        Division division = getDivision(id);

        if (positionRepository.existsByDivision_IdAndDeletedFalse(id)) {
            throw new DomainException("DIV_HAS_POSITIONS", "Cannot delete division with existing positions", HttpStatus.BAD_REQUEST);
        }

        organizationUnitRepository.findByDivision_IdAndDeletedFalse(id)
                .ifPresent(unit -> {
                    if (organizationUnitRepository.existsByParentUnit_IdAndDeletedFalse(unit.getId())) {
                        throw new DomainException("UNIT_HAS_CHILDREN", "Cannot delete division unit that has child organization units", HttpStatus.BAD_REQUEST);
                    }
                    unit.setDeleted(true);
                });

        division.setDeleted(true);
    }

    public Division getDivision(UUID id) {
        return divisionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Division"));
    }

    private DivisionResponse toResponse(Division division) {
        return new DivisionResponse(
                division.getId(),
                division.getCompany().getId(),
                division.getDepartment().getId(),
                division.getDepartment().getName(),
                division.getCode(),
                division.getName(),
                division.getStatus(),
                division.getCreatedAt(),
                division.getUpdatedAt(),
                division.getVersion()
        );
    }
}
