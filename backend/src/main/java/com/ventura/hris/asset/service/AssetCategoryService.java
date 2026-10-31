package com.ventura.hris.asset.service;

import com.ventura.hris.asset.dto.AssetCategoryRequest;
import com.ventura.hris.asset.dto.AssetCategoryResponse;
import com.ventura.hris.asset.entity.AssetCategory;
import com.ventura.hris.asset.repository.AssetCategoryRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetCategoryService {

    private final AssetCategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;

    public AssetCategoryService(AssetCategoryRepository categoryRepository,
                                CompanyRepository companyRepository) {
        this.categoryRepository = categoryRepository;
        this.companyRepository = companyRepository;
    }

    public AssetCategoryResponse createCategory(AssetCategoryRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.companyId()));

        if (categoryRepository.findByCompanyIdAndCode(company.getId(), request.code().trim().toUpperCase()).isPresent()) {
            throw new DomainException("DUPLICATE_CODE", "Asset category code already exists for this company");
        }

        AssetCategory cat = new AssetCategory();
        cat.setCompany(company);
        cat.setCode(request.code().trim().toUpperCase());
        cat.setName(request.name().trim());
        cat.setDescription(request.description());

        AssetCategory saved = categoryRepository.save(cat);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssetCategoryResponse> getCategories(UUID companyId) {
        List<AssetCategory> list;
        if (companyId != null) {
            list = categoryRepository.findByCompanyId(companyId);
        } else {
            list = categoryRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssetCategoryResponse getCategoryById(UUID id) {
        AssetCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset category not found: " + id));
        return mapToResponse(cat);
    }

    private AssetCategoryResponse mapToResponse(AssetCategory cat) {
        return new AssetCategoryResponse(
                cat.getId(),
                cat.getCompany() != null ? cat.getCompany().getId() : null,
                cat.getCode(),
                cat.getName(),
                cat.getDescription(),
                cat.getCreatedAt(),
                cat.getUpdatedAt()
        );
    }
}
