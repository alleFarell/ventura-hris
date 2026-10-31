package com.ventura.hris.setup.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.setup.dto.BranchResponse;
import com.ventura.hris.setup.dto.CreateBranchRequest;
import com.ventura.hris.setup.dto.UpdateBranchRequest;
import com.ventura.hris.setup.entity.Branch;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.entity.RecordStatus;
import com.ventura.hris.setup.repository.BranchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class BranchService {

    private final BranchRepository branchRepository;
    private final CompanyService companyService;
    private final SetupStatusParser statusParser;

    public BranchService(BranchRepository branchRepository, CompanyService companyService, SetupStatusParser statusParser) {
        this.branchRepository = branchRepository;
        this.companyService = companyService;
        this.statusParser = statusParser;
    }

    @Transactional(readOnly = true)
    public Page<BranchResponse> list(String search, UUID companyId, String status, Pageable pageable) {
        RecordStatus parsedStatus = statusParser.parseOptional(status);
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        return branchRepository.search(normalizedSearch, companyId, parsedStatus, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BranchResponse get(UUID id) {
        return toResponse(getBranch(id));
    }

    @Transactional
    public BranchResponse create(CreateBranchRequest request) {
        Company company = companyService.getActiveCompany(request.companyId());
        if (branchRepository.existsByCompany_IdAndCodeIgnoreCase(company.getId(), request.code().trim())) {
            throw new DomainException("SETUP_BRANCH_CODE_DUPLICATE", "Branch code already exists for this company", HttpStatus.CONFLICT);
        }

        RecordStatus status = statusParser.parseOrDefault(request.status(), RecordStatus.DRAFT);
        validateActivation(status, request.addressLine1(), request.city());

        Branch branch = new Branch(
                company,
                request.code(),
                request.name().trim(),
                request.addressLine1(),
                request.addressLine2(),
                request.city(),
                request.province(),
                request.postalCode(),
                request.countryCode(),
                status
        );

        return toResponse(branchRepository.save(branch));
    }

    @Transactional
    public BranchResponse update(UUID id, UpdateBranchRequest request) {
        Branch branch = getBranch(id);
        RecordStatus status = statusParser.parseOrDefault(request.status(), branch.getStatus());
        validateActivation(status, request.addressLine1(), request.city());

        branch.update(
                request.name().trim(),
                request.addressLine1(),
                request.addressLine2(),
                request.city(),
                request.province(),
                request.postalCode(),
                request.countryCode(),
                status
        );

        return toResponse(branch);
    }

    @Transactional
    public void delete(UUID id) {
        Branch branch = getBranch(id);
        branch.markDeleted();
    }

    private Branch getBranch(UUID id) {
        return branchRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch"));
    }

    private void validateActivation(RecordStatus status, String addressLine1, String city) {
        if (status == RecordStatus.ACTIVE && (!StringUtils.hasText(addressLine1) || !StringUtils.hasText(city))) {
            throw new DomainException("SETUP_BRANCH_ACTIVATION_INCOMPLETE", "Address line 1 and city are required before branch activation", HttpStatus.BAD_REQUEST);
        }
    }

    private BranchResponse toResponse(Branch branch) {
        return new BranchResponse(
                branch.getId(),
                branch.getCompany().getId(),
                branch.getCompany().getCode(),
                branch.getCode(),
                branch.getName(),
                branch.getAddressLine1(),
                branch.getAddressLine2(),
                branch.getCity(),
                branch.getProvince(),
                branch.getPostalCode(),
                branch.getCountryCode(),
                branch.getStatus(),
                branch.getCreatedAt(),
                branch.getUpdatedAt(),
                branch.getVersion()
        );
    }
}
