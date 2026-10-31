package com.ventura.hris.setup.service;

import com.ventura.hris.setup.dto.SetupReadinessResponse;
import com.ventura.hris.setup.entity.RecordStatus;
import com.ventura.hris.setup.repository.BranchRepository;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SetupReadinessService {

    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;

    public SetupReadinessService(CompanyRepository companyRepository, BranchRepository branchRepository) {
        this.companyRepository = companyRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional(readOnly = true)
    public SetupReadinessResponse getReadiness() {
        boolean hasActiveCompany = companyRepository.existsByStatusAndDeletedFalse(RecordStatus.ACTIVE);
        boolean hasActiveBranch = branchRepository.existsByCompany_StatusAndStatusAndDeletedFalse(RecordStatus.ACTIVE, RecordStatus.ACTIVE);
        List<String> missingItems = new ArrayList<>();

        if (!hasActiveCompany) {
            missingItems.add("Create and activate a company");
        }
        if (!hasActiveBranch) {
            missingItems.add("Create and activate at least one branch");
        }

        return new SetupReadinessResponse(hasActiveCompany && hasActiveBranch, hasActiveCompany, hasActiveBranch, missingItems);
    }
}
