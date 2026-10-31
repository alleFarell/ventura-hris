package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.organization.entity.Grade;
import com.ventura.hris.organization.repository.GradeRepository;
import com.ventura.hris.payroll.dto.SalaryStructureCreateRequest;
import com.ventura.hris.payroll.dto.SalaryStructureResponse;
import com.ventura.hris.payroll.entity.SalaryStructure;
import com.ventura.hris.payroll.repository.SalaryStructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SalaryStructureService {

    private final SalaryStructureRepository structureRepository;
    private final GradeRepository gradeRepository;

    public SalaryStructureService(SalaryStructureRepository structureRepository, GradeRepository gradeRepository) {
        this.structureRepository = structureRepository;
        this.gradeRepository = gradeRepository;
    }

    @Transactional(readOnly = true)
    public List<SalaryStructureResponse> getAllStructures() {
        return structureRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalaryStructureResponse getStructureByGrade(UUID gradeId) {
        SalaryStructure structure = structureRepository.findByGradeId(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure for Grade", gradeId));
        return mapToResponse(structure);
    }

    @Transactional
    public SalaryStructureResponse createOrUpdateStructure(SalaryStructureCreateRequest req) {
        if (req.getMinSalary().compareTo(req.getMidpointSalary()) > 0) {
            throw new DomainException("INVALID_SALARY_RANGE", "Minimum salary cannot be greater than midpoint salary");
        }
        if (req.getMidpointSalary().compareTo(req.getMaxSalary()) > 0) {
            throw new DomainException("INVALID_SALARY_RANGE", "Midpoint salary cannot be greater than maximum salary");
        }

        Grade grade = gradeRepository.findById(req.getGradeId())
                .orElseThrow(() -> new ResourceNotFoundException("Grade", req.getGradeId()));

        SalaryStructure structure = structureRepository.findByGradeId(req.getGradeId())
                .orElseGet(() -> {
                    SalaryStructure s = new SalaryStructure();
                    s.setGrade(grade);
                    return s;
                });

        structure.setMinSalary(req.getMinSalary());
        structure.setMidpointSalary(req.getMidpointSalary());
        structure.setMaxSalary(req.getMaxSalary());
        structure.setCurrency(req.getCurrency() != null ? req.getCurrency() : "IDR");
        structure.setIsActive(true);

        SalaryStructure saved = structureRepository.save(structure);
        return mapToResponse(saved);
    }

    public SalaryStructureResponse mapToResponse(SalaryStructure s) {
        SalaryStructureResponse res = new SalaryStructureResponse();
        res.setId(s.getId());
        res.setGradeId(s.getGrade().getId());
        res.setGradeCode(s.getGrade().getCode());
        res.setGradeName(s.getGrade().getName());
        res.setMinSalary(s.getMinSalary());
        res.setMidpointSalary(s.getMidpointSalary());
        res.setMaxSalary(s.getMaxSalary());
        res.setCurrency(s.getCurrency());
        res.setIsActive(s.getIsActive());
        res.setCreatedAt(s.getCreatedAt());
        res.setUpdatedAt(s.getUpdatedAt());
        return res;
    }
}
