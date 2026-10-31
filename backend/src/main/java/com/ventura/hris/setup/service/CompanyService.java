package com.ventura.hris.setup.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.setup.dto.CompanyResponse;
import com.ventura.hris.setup.dto.CreateCompanyRequest;
import com.ventura.hris.setup.dto.UpdateCompanyRequest;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.entity.RecordStatus;
import com.ventura.hris.setup.repository.CompanyRepository;
import com.ventura.hris.setup.repository.BranchRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;
    private final SetupStatusParser statusParser;

    public CompanyService(CompanyRepository companyRepository, @Lazy BranchRepository branchRepository, SetupStatusParser statusParser) {
        this.companyRepository = companyRepository;
        this.branchRepository = branchRepository;
        this.statusParser = statusParser;
    }

    @Transactional(readOnly = true)
    public Page<CompanyResponse> list(String search, String status, Pageable pageable) {
        RecordStatus parsedStatus = statusParser.parseOptional(status);
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        return companyRepository.search(normalizedSearch, parsedStatus, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CompanyResponse get(UUID id) {
        return toResponse(getCompany(id));
    }

    @Transactional
    public CompanyResponse create(CreateCompanyRequest request) {
        companyRepository.findByCodeIgnoreCase(request.code().trim())
                .ifPresent(company -> {
                    throw new DomainException("SETUP_COMPANY_CODE_DUPLICATE", "Company code already exists", HttpStatus.CONFLICT);
                });

        RecordStatus status = statusParser.parseOrDefault(request.status(), RecordStatus.DRAFT);
        validateActivation(status, request.defaultLocale(), request.defaultTimezone(), request.defaultCurrency());

        Company company = new Company(
                request.code(),
                request.name().trim(),
                request.legalName().trim(),
                request.taxIdentifier(),
                request.defaultLocale().trim(),
                request.defaultTimezone().trim(),
                request.defaultCurrency().trim(),
                request.defaultDateFormat().trim(),
                status
        );

        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse update(UUID id, UpdateCompanyRequest request) {
        Company company = getCompany(id);
        RecordStatus status = statusParser.parseOrDefault(request.status(), company.getStatus());
        validateActivation(status, request.defaultLocale(), request.defaultTimezone(), request.defaultCurrency());

        company.update(
                request.name().trim(),
                request.legalName().trim(),
                request.taxIdentifier(),
                request.defaultLocale().trim(),
                request.defaultTimezone().trim(),
                request.defaultCurrency().trim(),
                request.defaultDateFormat().trim(),
                status
        );

        return toResponse(company);
    }

    @Transactional
    public void delete(UUID id) {
        Company company = getCompany(id);
        if (branchRepository.existsByCompany_IdAndDeletedFalse(id)) {
            throw new DomainException("SETUP_COMPANY_HAS_BRANCHES", "Cannot delete company with active branches. Please remove branches first.", HttpStatus.BAD_REQUEST);
        }
        company.markDeleted();
    }

    @Transactional(readOnly = true)
    public Company getActiveCompany(UUID id) {
        Company company = getCompany(id);
        if (company.getStatus() != RecordStatus.ACTIVE) {
            throw new DomainException("SETUP_COMPANY_INACTIVE", "Company must be active", HttpStatus.BAD_REQUEST);
        }
        return company;
    }

    private Company getCompany(UUID id) {
        return companyRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company"));
    }

    private void validateActivation(RecordStatus status, String locale, String timezone, String currency) {
        if (status == RecordStatus.ACTIVE
                && (!StringUtils.hasText(locale) || !StringUtils.hasText(timezone) || !StringUtils.hasText(currency))) {
            throw new DomainException("SETUP_INVALID_LOCALE", "Locale, timezone, and currency are required before activation", HttpStatus.BAD_REQUEST);
        }
    }

    private CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getCode(),
                company.getName(),
                company.getLegalName(),
                company.getTaxIdentifier(),
                company.getDefaultLocale(),
                company.getDefaultTimezone(),
                company.getDefaultCurrency(),
                company.getDefaultDateFormat(),
                company.getStatus(),
                company.getCreatedAt(),
                company.getUpdatedAt(),
                company.getVersion()
        );
    }
}
