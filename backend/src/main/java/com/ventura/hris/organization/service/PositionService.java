package com.ventura.hris.organization.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.organization.dto.CreatePositionRequest;
import com.ventura.hris.organization.dto.PositionResponse;
import com.ventura.hris.organization.dto.UpdatePositionRequest;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Division;
import com.ventura.hris.organization.entity.Grade;
import com.ventura.hris.organization.entity.JobLevel;
import com.ventura.hris.organization.entity.OrganizationUnit;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.DivisionRepository;
import com.ventura.hris.organization.repository.GradeRepository;
import com.ventura.hris.organization.repository.JobLevelRepository;
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
public class PositionService {

    private final PositionRepository positionRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final DivisionRepository divisionRepository;
    private final GradeRepository gradeRepository;
    private final JobLevelRepository jobLevelRepository;
    private final OrganizationUnitRepository organizationUnitRepository;

    public PositionService(
            PositionRepository positionRepository,
            CompanyRepository companyRepository,
            DepartmentRepository departmentRepository,
            DivisionRepository divisionRepository,
            GradeRepository gradeRepository,
            JobLevelRepository jobLevelRepository,
            OrganizationUnitRepository organizationUnitRepository
    ) {
        this.positionRepository = positionRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.divisionRepository = divisionRepository;
        this.gradeRepository = gradeRepository;
        this.jobLevelRepository = jobLevelRepository;
        this.organizationUnitRepository = organizationUnitRepository;
    }

    @Transactional(readOnly = true)
    public Page<PositionResponse> list(
            String search,
            UUID companyId,
            UUID departmentId,
            UUID divisionId,
            UUID gradeId,
            UUID jobLevelId,
            String status,
            Pageable pageable
    ) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        String normalizedStatus = StringUtils.hasText(status) ? status.trim().toUpperCase() : null;
        return positionRepository.search(
                normalizedSearch, companyId, departmentId, divisionId, gradeId, jobLevelId, normalizedStatus, pageable
        ).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PositionResponse get(UUID id) {
        return toResponse(getPosition(id));
    }

    @Transactional
    public PositionResponse create(CreatePositionRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company"));

        String code = request.code().trim();
        if (positionRepository.existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(company.getId(), code)) {
            throw new DomainException("POSITION_CODE_DUPLICATE", "Position code already exists for this company", HttpStatus.CONFLICT);
        }

        Department department = null;
        if (request.departmentId() != null) {
            department = departmentRepository.findByIdAndDeletedFalse(request.departmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department"));
            if (!department.getCompany().getId().equals(company.getId())) {
                throw new DomainException("INVALID_DEPARTMENT", "Department does not belong to the position's company", HttpStatus.BAD_REQUEST);
            }
        }

        Division division = null;
        if (request.divisionId() != null) {
            division = divisionRepository.findByIdAndDeletedFalse(request.divisionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Division"));
            if (department != null && !division.getDepartment().getId().equals(department.getId())) {
                throw new DomainException("INVALID_DIVISION", "Division does not belong to the specified department", HttpStatus.BAD_REQUEST);
            }
        }

        Grade grade = null;
        if (request.gradeId() != null) {
            grade = gradeRepository.findByIdAndDeletedFalse(request.gradeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grade"));
            if (!grade.getCompany().getId().equals(company.getId())) {
                throw new DomainException("INVALID_GRADE", "Grade does not belong to the position's company", HttpStatus.BAD_REQUEST);
            }
        }

        JobLevel jobLevel = null;
        if (request.jobLevelId() != null) {
            jobLevel = jobLevelRepository.findByIdAndDeletedFalse(request.jobLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobLevel"));
            if (!jobLevel.getCompany().getId().equals(company.getId())) {
                throw new DomainException("INVALID_JOB_LEVEL", "Job level does not belong to the position's company", HttpStatus.BAD_REQUEST);
            }
        }

        String status = StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE";

        Position position = new Position(
                company,
                department,
                division,
                grade,
                jobLevel,
                code,
                request.name().trim(),
                status
        );

        Position savedPosition = positionRepository.save(position);

        // Auto-sync into organization unit hierarchy
        OrganizationUnit parentUnit = null;
        if (request.parentUnitId() != null) {
            parentUnit = organizationUnitRepository.findByIdAndDeletedFalse(request.parentUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent OrganizationUnit"));
        } else if (division != null) {
            parentUnit = organizationUnitRepository.findByDivision_IdAndDeletedFalse(division.getId()).orElse(null);
        } else if (department != null) {
            parentUnit = organizationUnitRepository.findByDepartment_IdAndDeletedFalse(department.getId()).orElse(null);
        }

        OrganizationUnit unit = new OrganizationUnit(
                company,
                parentUnit,
                department,
                division,
                savedPosition,
                savedPosition.getCode(),
                savedPosition.getName(),
                "POSITION",
                savedPosition.getStatus()
        );
        organizationUnitRepository.save(unit);

        return toResponse(savedPosition);
    }

    @Transactional
    public PositionResponse update(UUID id, UpdatePositionRequest request) {
        Position position = getPosition(id);

        if (request.departmentId() != null) {
            Department department = departmentRepository.findByIdAndDeletedFalse(request.departmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department"));
            if (!department.getCompany().getId().equals(position.getCompany().getId())) {
                throw new DomainException("INVALID_DEPARTMENT", "Department does not belong to the position's company", HttpStatus.BAD_REQUEST);
            }
            position.setDepartment(department);
        } else {
            position.setDepartment(null);
        }

        if (request.divisionId() != null) {
            Division division = divisionRepository.findByIdAndDeletedFalse(request.divisionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Division"));
            position.setDivision(division);
        } else {
            position.setDivision(null);
        }

        if (request.gradeId() != null) {
            Grade grade = gradeRepository.findByIdAndDeletedFalse(request.gradeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grade"));
            position.setGrade(grade);
        } else {
            position.setGrade(null);
        }

        if (request.jobLevelId() != null) {
            JobLevel jobLevel = jobLevelRepository.findByIdAndDeletedFalse(request.jobLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobLevel"));
            position.setJobLevel(jobLevel);
        } else {
            position.setJobLevel(null);
        }

        position.setName(request.name().trim());
        if (StringUtils.hasText(request.status())) {
            position.setStatus(request.status().trim().toUpperCase());
        }

        organizationUnitRepository.findByPosition_IdAndDeletedFalse(position.getId())
                .ifPresent(unit -> {
                    unit.setName(position.getName());
                    unit.setStatus(position.getStatus());
                    unit.setDepartment(position.getDepartment());
                    unit.setDivision(position.getDivision());
                });

        return toResponse(position);
    }

    @Transactional
    public void delete(UUID id) {
        Position position = getPosition(id);

        organizationUnitRepository.findByPosition_IdAndDeletedFalse(id)
                .ifPresent(unit -> {
                    if (organizationUnitRepository.existsByParentUnit_IdAndDeletedFalse(unit.getId())) {
                        throw new DomainException("UNIT_HAS_CHILDREN", "Cannot delete position unit that has child organization units", HttpStatus.BAD_REQUEST);
                    }
                    unit.setDeleted(true);
                });

        position.setDeleted(true);
    }

    public Position getPosition(UUID id) {
        return positionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position"));
    }

    private PositionResponse toResponse(Position position) {
        return new PositionResponse(
                position.getId(),
                position.getCompany().getId(),
                position.getDepartment() != null ? position.getDepartment().getId() : null,
                position.getDepartment() != null ? position.getDepartment().getName() : null,
                position.getDivision() != null ? position.getDivision().getId() : null,
                position.getDivision() != null ? position.getDivision().getName() : null,
                position.getGrade() != null ? position.getGrade().getId() : null,
                position.getGrade() != null ? position.getGrade().getName() : null,
                position.getJobLevel() != null ? position.getJobLevel().getId() : null,
                position.getJobLevel() != null ? position.getJobLevel().getName() : null,
                position.getCode(),
                position.getName(),
                position.getStatus(),
                position.getCreatedAt(),
                position.getUpdatedAt(),
                position.getVersion()
        );
    }
}
