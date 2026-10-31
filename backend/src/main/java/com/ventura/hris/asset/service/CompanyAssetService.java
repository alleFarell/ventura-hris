package com.ventura.hris.asset.service;

import com.ventura.hris.asset.dto.CompanyAssetRequest;
import com.ventura.hris.asset.dto.CompanyAssetResponse;
import com.ventura.hris.asset.entity.AssetAllocation;
import com.ventura.hris.asset.entity.AssetCategory;
import com.ventura.hris.asset.entity.CompanyAsset;
import com.ventura.hris.asset.repository.AssetAllocationRepository;
import com.ventura.hris.asset.repository.AssetCategoryRepository;
import com.ventura.hris.asset.repository.CompanyAssetRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyAssetService {

    private final CompanyAssetRepository assetRepository;
    private final AssetCategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;
    private final AssetAllocationRepository allocationRepository;

    public CompanyAssetService(CompanyAssetRepository assetRepository,
                               AssetCategoryRepository categoryRepository,
                               CompanyRepository companyRepository,
                               AssetAllocationRepository allocationRepository) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.companyRepository = companyRepository;
        this.allocationRepository = allocationRepository;
    }

    public CompanyAssetResponse createAsset(CompanyAssetRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.companyId()));

        AssetCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset category not found: " + request.categoryId()));

        if (assetRepository.findByCompanyIdAndAssetTag(company.getId(), request.assetTag().trim().toUpperCase()).isPresent()) {
            throw new DomainException("DUPLICATE_ASSET_TAG", "Asset tag already exists in this company: " + request.assetTag());
        }

        CompanyAsset asset = new CompanyAsset();
        asset.setCompany(company);
        asset.setCategory(category);
        asset.setAssetTag(request.assetTag().trim().toUpperCase());
        asset.setName(request.name().trim());
        asset.setModel(request.model());
        asset.setSerialNumber(request.serialNumber());
        asset.setPurchaseDate(request.purchaseDate());
        asset.setPurchaseCost(request.purchaseCost() != null ? request.purchaseCost() : BigDecimal.ZERO);
        asset.setStatus(request.status() != null && !request.status().isBlank() ? request.status().trim().toUpperCase() : "AVAILABLE");
        asset.setConditionGrade(request.conditionGrade() != null && !request.conditionGrade().isBlank() ? request.conditionGrade().trim().toUpperCase() : "EXCELLENT");
        asset.setNotes(request.notes());

        CompanyAsset saved = assetRepository.save(asset);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CompanyAssetResponse> getAssets(UUID companyId, UUID categoryId, String status) {
        List<CompanyAsset> list;
        if (companyId != null && categoryId != null) {
            list = assetRepository.findByCompanyIdAndCategoryId(companyId, categoryId);
        } else if (companyId != null && status != null && !status.isBlank()) {
            list = assetRepository.findByCompanyIdAndStatus(companyId, status.trim().toUpperCase());
        } else if (companyId != null) {
            list = assetRepository.findByCompanyId(companyId);
        } else {
            list = assetRepository.findAll();
        }

        if (status != null && !status.isBlank() && companyId == null) {
            list = list.stream().filter(a -> status.equalsIgnoreCase(a.getStatus())).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyAssetResponse getAssetById(UUID id) {
        CompanyAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
        return mapToResponse(asset);
    }

    public CompanyAssetResponse updateStatus(UUID id, String status, String conditionGrade) {
        CompanyAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
        asset.setStatus(status.trim().toUpperCase());
        if (conditionGrade != null && !conditionGrade.isBlank()) {
            asset.setConditionGrade(conditionGrade.trim().toUpperCase());
        }
        return mapToResponse(assetRepository.save(asset));
    }

    private CompanyAssetResponse mapToResponse(CompanyAsset a) {
        UUID assignedEmpId = null;
        String assignedEmpName = null;
        String assignedEmpNumber = null;

        List<AssetAllocation> activeAllocations = allocationRepository.findByAssetIdAndStatus(a.getId(), "ACTIVE");
        if (!activeAllocations.isEmpty()) {
            AssetAllocation alloc = activeAllocations.get(0);
            if (alloc.getEmployee() != null) {
                assignedEmpId = alloc.getEmployee().getId();
                assignedEmpName = alloc.getEmployee().getFirstName() + " " + (alloc.getEmployee().getLastName() != null ? alloc.getEmployee().getLastName() : "");
                assignedEmpName = assignedEmpName.trim();
                assignedEmpNumber = alloc.getEmployee().getEmployeeNumber();
            }
        }

        return new CompanyAssetResponse(
                a.getId(),
                a.getCompany() != null ? a.getCompany().getId() : null,
                a.getCategory() != null ? a.getCategory().getId() : null,
                a.getCategory() != null ? a.getCategory().getName() : null,
                a.getAssetTag(),
                a.getName(),
                a.getModel(),
                a.getSerialNumber(),
                a.getPurchaseDate(),
                a.getPurchaseCost(),
                a.getStatus(),
                a.getConditionGrade(),
                a.getNotes(),
                assignedEmpId,
                assignedEmpName,
                assignedEmpNumber,
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    public CompanyAssetResponse updateAsset(UUID id, CompanyAssetRequest request) {
        CompanyAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));

        AssetCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset category not found: " + request.categoryId()));

        asset.setCategory(category);
        asset.setName(request.name().trim());
        asset.setModel(request.model());
        asset.setSerialNumber(request.serialNumber());
        asset.setPurchaseDate(request.purchaseDate());
        asset.setPurchaseCost(request.purchaseCost());
        if (request.status() != null) asset.setStatus(request.status());
        if (request.conditionGrade() != null) asset.setConditionGrade(request.conditionGrade());
        asset.setNotes(request.notes());

        return mapToResponse(assetRepository.save(asset));
    }

    public void deleteAsset(UUID id) {
        CompanyAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
        assetRepository.delete(asset);
    }
}
