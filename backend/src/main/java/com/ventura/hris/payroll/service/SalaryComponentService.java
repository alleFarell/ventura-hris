package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import com.ventura.hris.payroll.dto.SalaryComponentCreateRequest;
import com.ventura.hris.payroll.dto.SalaryComponentResponse;
import com.ventura.hris.payroll.dto.SalaryComponentUpdateRequest;
import com.ventura.hris.payroll.entity.SalaryComponent;
import com.ventura.hris.payroll.repository.SalaryComponentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SalaryComponentService {

    private final SalaryComponentRepository componentRepository;

    public SalaryComponentService(SalaryComponentRepository componentRepository) {
        this.componentRepository = componentRepository;
    }

    @Transactional(readOnly = true)
    public List<SalaryComponentResponse> getAllComponents() {
        return componentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalaryComponentResponse> getActiveComponents() {
        return componentRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalaryComponentResponse getComponentById(UUID id) {
        SalaryComponent comp = componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryComponent", id));
        return mapToResponse(comp);
    }

    @Transactional
    public SalaryComponentResponse createComponent(SalaryComponentCreateRequest req) {
        if (componentRepository.existsByCodeIgnoreCase(req.getCode().trim())) {
            throw new DomainException("DUPLICATE_RESOURCE", "Salary component with code '" + req.getCode() + "' already exists", HttpStatus.CONFLICT);
        }

        SalaryComponent comp = new SalaryComponent();
        comp.setCode(req.getCode().trim().toUpperCase());
        comp.setName(req.getName().trim());
        comp.setDescription(req.getDescription());
        comp.setType(req.getType().trim().toUpperCase());
        comp.setIsTaxable(req.getIsTaxable() != null ? req.getIsTaxable() : true);
        comp.setIsBpjsApplicable(req.getIsBpjsApplicable() != null ? req.getIsBpjsApplicable() : true);
        comp.setDefaultAmount(req.getDefaultAmount() != null ? req.getDefaultAmount() : BigDecimal.ZERO);
        comp.setIsActive(true);

        SalaryComponent saved = componentRepository.save(comp);
        return mapToResponse(saved);
    }

    @Transactional
    public SalaryComponentResponse updateComponent(UUID id, SalaryComponentUpdateRequest req) {
        SalaryComponent comp = componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryComponent", id));

        if (req.getName() != null) comp.setName(req.getName().trim());
        if (req.getDescription() != null) comp.setDescription(req.getDescription());
        if (req.getType() != null) comp.setType(req.getType().trim().toUpperCase());
        if (req.getIsTaxable() != null) comp.setIsTaxable(req.getIsTaxable());
        if (req.getIsBpjsApplicable() != null) comp.setIsBpjsApplicable(req.getIsBpjsApplicable());
        if (req.getDefaultAmount() != null) comp.setDefaultAmount(req.getDefaultAmount());
        if (req.getIsActive() != null) comp.setIsActive(req.getIsActive());

        SalaryComponent saved = componentRepository.save(comp);
        return mapToResponse(saved);
    }

    public SalaryComponentResponse mapToResponse(SalaryComponent comp) {
        SalaryComponentResponse res = new SalaryComponentResponse();
        res.setId(comp.getId());
        res.setCode(comp.getCode());
        res.setName(comp.getName());
        res.setDescription(comp.getDescription());
        res.setType(comp.getType());
        res.setIsTaxable(comp.getIsTaxable());
        res.setIsBpjsApplicable(comp.getIsBpjsApplicable());
        res.setDefaultAmount(comp.getDefaultAmount());
        res.setIsActive(comp.getIsActive());
        res.setCreatedAt(comp.getCreatedAt());
        res.setUpdatedAt(comp.getUpdatedAt());
        return res;
    }
}
