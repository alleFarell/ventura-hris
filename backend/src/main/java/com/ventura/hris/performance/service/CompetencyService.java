package com.ventura.hris.performance.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.performance.dto.CompetencyModelRequest;
import com.ventura.hris.performance.dto.CompetencyModelResponse;
import com.ventura.hris.performance.entity.CompetencyModel;
import com.ventura.hris.performance.repository.CompetencyModelRepository;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompetencyService {

    private final CompetencyModelRepository competencyRepository;
    private final CompanyRepository companyRepository;

    public CompetencyService(CompetencyModelRepository competencyRepository,
                             CompanyRepository companyRepository) {
        this.competencyRepository = competencyRepository;
        this.companyRepository = companyRepository;
    }

    public CompetencyModelResponse createCompetency(CompetencyModelRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.companyId()));

        if (competencyRepository.findByCompanyIdAndCode(company.getId(), request.code()).isPresent()) {
            throw new DomainException("DUPLICATE_CODE", "Competency code already exists for this company");
        }

        CompetencyModel model = new CompetencyModel();
        model.setCompany(company);
        model.setCode(request.code().toUpperCase().trim());
        model.setName(request.name());
        model.setCategory(request.category() != null ? request.category() : "CORE");
        model.setDescription(request.description());
        model.setWeight(request.weight() != null ? request.weight() : 20);

        CompetencyModel saved = competencyRepository.save(model);
        return mapToResponse(saved);
    }

    public List<CompetencyModelResponse> getCompetencies(UUID companyId, String category) {
        List<CompetencyModel> list;
        if (companyId != null) {
            list = competencyRepository.findByCompanyId(companyId);
        } else {
            list = competencyRepository.findAll();
        }
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            list = list.stream().filter(c -> category.equalsIgnoreCase(c.getCategory())).collect(Collectors.toList());
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public CompetencyModelResponse getCompetency(UUID id) {
        CompetencyModel model = competencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Competency not found: " + id));
        return mapToResponse(model);
    }

    private CompetencyModelResponse mapToResponse(CompetencyModel m) {
        return new CompetencyModelResponse(
                m.getId(),
                m.getCompany() != null ? m.getCompany().getId() : null,
                m.getCode(),
                m.getName(),
                m.getCategory(),
                m.getDescription(),
                m.getWeight(),
                m.getCreatedAt()
        );
    }
}
