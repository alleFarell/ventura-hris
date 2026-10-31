package com.ventura.hris.organization.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.organization.dto.CreateGradeRequest;
import com.ventura.hris.organization.dto.CreateJobLevelRequest;
import com.ventura.hris.organization.dto.GradeResponse;
import com.ventura.hris.organization.dto.JobLevelResponse;
import com.ventura.hris.organization.dto.UpdateGradeRequest;
import com.ventura.hris.organization.dto.UpdateJobLevelRequest;
import com.ventura.hris.organization.entity.Grade;
import com.ventura.hris.organization.entity.JobLevel;
import com.ventura.hris.organization.repository.GradeRepository;
import com.ventura.hris.organization.repository.JobLevelRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class JobStructureService {

    private final GradeRepository gradeRepository;
    private final JobLevelRepository jobLevelRepository;
    private final CompanyRepository companyRepository;
    private final PositionRepository positionRepository;

    public JobStructureService(
            GradeRepository gradeRepository,
            JobLevelRepository jobLevelRepository,
            CompanyRepository companyRepository,
            PositionRepository positionRepository
    ) {
        this.gradeRepository = gradeRepository;
        this.jobLevelRepository = jobLevelRepository;
        this.companyRepository = companyRepository;
        this.positionRepository = positionRepository;
    }

    // ==================== GRADES ====================

    @Transactional(readOnly = true)
    public List<GradeResponse> listGrades(UUID companyId) {
        return gradeRepository.findByCompany_IdAndDeletedFalseOrderBySortOrderAsc(companyId)
                .stream()
                .map(this::toGradeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GradeResponse getGrade(UUID id) {
        return toGradeResponse(findGradeById(id));
    }

    @Transactional
    public GradeResponse createGrade(CreateGradeRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company"));

        String code = request.code().trim();
        if (gradeRepository.existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(company.getId(), code)) {
            throw new DomainException("GRADE_CODE_DUPLICATE", "Grade code already exists for this company", HttpStatus.CONFLICT);
        }

        if (gradeRepository.existsByCompany_IdAndSortOrderAndDeletedFalse(company.getId(), request.sortOrder())) {
            throw new DomainException("GRADE_SORT_ORDER_DUPLICATE", "Grade sort order must be unique within the company", HttpStatus.CONFLICT);
        }

        String status = StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE";

        Grade grade = new Grade(
                company,
                code,
                request.name().trim(),
                request.sortOrder(),
                status
        );

        return toGradeResponse(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse updateGrade(UUID id, UpdateGradeRequest request) {
        Grade grade = findGradeById(id);

        if (gradeRepository.existsByCompany_IdAndSortOrderAndIdNotAndDeletedFalse(
                grade.getCompany().getId(), request.sortOrder(), grade.getId())) {
            throw new DomainException("GRADE_SORT_ORDER_DUPLICATE", "Grade sort order must be unique within the company", HttpStatus.CONFLICT);
        }

        grade.setName(request.name().trim());
        grade.setSortOrder(request.sortOrder());
        if (StringUtils.hasText(request.status())) {
            grade.setStatus(request.status().trim().toUpperCase());
        }

        return toGradeResponse(grade);
    }

    @Transactional
    public void deleteGrade(UUID id) {
        Grade grade = findGradeById(id);

        if (positionRepository.existsByGrade_IdAndDeletedFalse(id)) {
            throw new DomainException("GRADE_IN_USE", "Cannot delete grade that is assigned to active positions", HttpStatus.BAD_REQUEST);
        }

        grade.setDeleted(true);
    }

    private Grade findGradeById(UUID id) {
        return gradeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade"));
    }

    private GradeResponse toGradeResponse(Grade grade) {
        return new GradeResponse(
                grade.getId(),
                grade.getCompany().getId(),
                grade.getCode(),
                grade.getName(),
                grade.getSortOrder(),
                grade.getStatus(),
                grade.getCreatedAt(),
                grade.getUpdatedAt(),
                grade.getVersion()
        );
    }

    // ==================== JOB LEVELS ====================

    @Transactional(readOnly = true)
    public List<JobLevelResponse> listJobLevels(UUID companyId) {
        return jobLevelRepository.findByCompany_IdAndDeletedFalseOrderBySortOrderAsc(companyId)
                .stream()
                .map(this::toJobLevelResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobLevelResponse getJobLevel(UUID id) {
        return toJobLevelResponse(findJobLevelById(id));
    }

    @Transactional
    public JobLevelResponse createJobLevel(CreateJobLevelRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company"));

        String code = request.code().trim();
        if (jobLevelRepository.existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(company.getId(), code)) {
            throw new DomainException("JOB_LEVEL_CODE_DUPLICATE", "Job level code already exists for this company", HttpStatus.CONFLICT);
        }

        if (jobLevelRepository.existsByCompany_IdAndSortOrderAndDeletedFalse(company.getId(), request.sortOrder())) {
            throw new DomainException("JOB_LEVEL_SORT_ORDER_DUPLICATE", "Job level sort order must be unique within the company", HttpStatus.CONFLICT);
        }

        String status = StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE";

        JobLevel jobLevel = new JobLevel(
                company,
                code,
                request.name().trim(),
                request.sortOrder(),
                status
        );

        return toJobLevelResponse(jobLevelRepository.save(jobLevel));
    }

    @Transactional
    public JobLevelResponse updateJobLevel(UUID id, UpdateJobLevelRequest request) {
        JobLevel jobLevel = findJobLevelById(id);

        if (jobLevelRepository.existsByCompany_IdAndSortOrderAndIdNotAndDeletedFalse(
                jobLevel.getCompany().getId(), request.sortOrder(), jobLevel.getId())) {
            throw new DomainException("JOB_LEVEL_SORT_ORDER_DUPLICATE", "Job level sort order must be unique within the company", HttpStatus.CONFLICT);
        }

        jobLevel.setName(request.name().trim());
        jobLevel.setSortOrder(request.sortOrder());
        if (StringUtils.hasText(request.status())) {
            jobLevel.setStatus(request.status().trim().toUpperCase());
        }

        return toJobLevelResponse(jobLevel);
    }

    @Transactional
    public void deleteJobLevel(UUID id) {
        JobLevel jobLevel = findJobLevelById(id);

        if (positionRepository.existsByJobLevel_IdAndDeletedFalse(id)) {
            throw new DomainException("JOB_LEVEL_IN_USE", "Cannot delete job level that is assigned to active positions", HttpStatus.BAD_REQUEST);
        }

        jobLevel.setDeleted(true);
    }

    private JobLevel findJobLevelById(UUID id) {
        return jobLevelRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobLevel"));
    }

    private JobLevelResponse toJobLevelResponse(JobLevel jobLevel) {
        return new JobLevelResponse(
                jobLevel.getId(),
                jobLevel.getCompany().getId(),
                jobLevel.getCode(),
                jobLevel.getName(),
                jobLevel.getSortOrder(),
                jobLevel.getStatus(),
                jobLevel.getCreatedAt(),
                jobLevel.getUpdatedAt(),
                jobLevel.getVersion()
        );
    }
}
