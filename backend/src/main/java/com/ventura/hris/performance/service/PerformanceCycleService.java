package com.ventura.hris.performance.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.performance.dto.PerformanceCycleRequest;
import com.ventura.hris.performance.dto.PerformanceCycleResponse;
import com.ventura.hris.performance.dto.PerformanceCycleStatusUpdateRequest;
import com.ventura.hris.performance.entity.PerformanceCycle;
import com.ventura.hris.performance.repository.PerformanceCycleRepository;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PerformanceCycleService {

    private final PerformanceCycleRepository cycleRepository;
    private final CompanyRepository companyRepository;

    public PerformanceCycleService(PerformanceCycleRepository cycleRepository,
                                   CompanyRepository companyRepository) {
        this.cycleRepository = cycleRepository;
        this.companyRepository = companyRepository;
    }

    public PerformanceCycleResponse createCycle(PerformanceCycleRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.companyId()));

        if (request.endDate().isBefore(request.startDate())) {
            throw new DomainException("INVALID_CYCLE_DATES", "Cycle end date cannot be before start date");
        }

        PerformanceCycle cycle = new PerformanceCycle();
        cycle.setCompany(company);
        cycle.setName(request.name());
        cycle.setCycleType(request.cycleType());
        cycle.setStartDate(request.startDate());
        cycle.setEndDate(request.endDate());
        cycle.setSelfReviewDeadline(request.selfReviewDeadline());
        cycle.setManagerReviewDeadline(request.managerReviewDeadline());
        cycle.setStatus("PLANNED");

        PerformanceCycle saved = cycleRepository.save(cycle);
        return mapToResponse(saved);
    }

    public List<PerformanceCycleResponse> getCycles(UUID companyId, String status) {
        List<PerformanceCycle> list;
        if (companyId != null) {
            list = cycleRepository.findByCompanyId(companyId);
        } else if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = cycleRepository.findByStatus(status);
        } else {
            list = cycleRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PerformanceCycleResponse getCycle(UUID id) {
        PerformanceCycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Performance cycle not found: " + id));
        return mapToResponse(cycle);
    }

    public PerformanceCycleResponse updateStatus(UUID id, PerformanceCycleStatusUpdateRequest request) {
        PerformanceCycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Performance cycle not found: " + id));

        cycle.setStatus(request.status());
        PerformanceCycle saved = cycleRepository.save(cycle);
        return mapToResponse(saved);
    }

    private PerformanceCycleResponse mapToResponse(PerformanceCycle c) {
        return new PerformanceCycleResponse(
                c.getId(),
                c.getCompany() != null ? c.getCompany().getId() : null,
                c.getCompany() != null ? c.getCompany().getLegalName() : "",
                c.getName(),
                c.getCycleType(),
                c.getStartDate(),
                c.getEndDate(),
                c.getSelfReviewDeadline(),
                c.getManagerReviewDeadline(),
                c.getStatus(),
                c.getCreatedAt()
        );
    }
}
