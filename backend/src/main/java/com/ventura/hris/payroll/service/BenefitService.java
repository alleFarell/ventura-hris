package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.entity.BenefitPlan;
import com.ventura.hris.payroll.entity.EmployeeBenefitClaim;
import com.ventura.hris.payroll.repository.BenefitPlanRepository;
import com.ventura.hris.payroll.repository.EmployeeBenefitClaimRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class BenefitService {

    private final BenefitPlanRepository benefitPlanRepository;
    private final EmployeeBenefitClaimRepository claimRepository;
    private final EmployeeRepository employeeRepository;

    public BenefitService(BenefitPlanRepository benefitPlanRepository,
                          EmployeeBenefitClaimRepository claimRepository,
                          EmployeeRepository employeeRepository) {
        this.benefitPlanRepository = benefitPlanRepository;
        this.claimRepository = claimRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<BenefitPlanResponse> getAllPlans(Boolean activeOnly) {
        List<BenefitPlan> plans = Boolean.TRUE.equals(activeOnly)
                ? benefitPlanRepository.findByIsActiveTrue()
                : benefitPlanRepository.findAll();
        return plans.stream().map(this::mapPlanToResponse).collect(Collectors.toList());
    }

    public BenefitPlanResponse getPlan(UUID id) {
        BenefitPlan plan = benefitPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefit plan not found with id: " + id));
        return mapPlanToResponse(plan);
    }

    public BenefitPlanResponse createPlan(BenefitPlanRequest request) {
        if (benefitPlanRepository.findByCode(request.code()).isPresent()) {
            throw new DomainException("DUPLICATE_CODE", "Benefit plan with code already exists: " + request.code());
        }

        BenefitPlan plan = new BenefitPlan();
        plan.setCode(request.code());
        plan.setName(request.name());
        plan.setCategory(request.category());
        plan.setAnnualLimit(request.annualLimit());
        plan.setDescription(request.description());
        if (request.isActive() != null) plan.setIsActive(request.isActive());

        BenefitPlan saved = benefitPlanRepository.save(plan);
        return mapPlanToResponse(saved);
    }

    public BenefitPlanResponse updatePlan(UUID id, BenefitPlanRequest request) {
        BenefitPlan plan = benefitPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefit plan not found with id: " + id));

        plan.setName(request.name());
        plan.setCategory(request.category());
        plan.setAnnualLimit(request.annualLimit());
        plan.setDescription(request.description());
        if (request.isActive() != null) plan.setIsActive(request.isActive());

        BenefitPlan saved = benefitPlanRepository.save(plan);
        return mapPlanToResponse(saved);
    }

    public EmployeeBenefitClaimResponse submitClaim(EmployeeBenefitClaimRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));

        BenefitPlan plan = benefitPlanRepository.findById(request.benefitPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Benefit plan not found with id: " + request.benefitPlanId()));

        if (!plan.getIsActive()) {
            throw new DomainException("INACTIVE_PLAN", "Benefit plan is inactive and cannot accept claims");
        }

        LocalDate claimDate = request.claimDate() != null ? request.claimDate() : LocalDate.now();
        LocalDate startOfYear = LocalDate.of(claimDate.getYear(), 1, 1);
        LocalDate endOfYear = LocalDate.of(claimDate.getYear(), 12, 31);

        BigDecimal claimedSoFar = claimRepository.sumClaimedAmountInPeriod(
                employee.getId(), plan.getId(), startOfYear, endOfYear
        );
        if (claimedSoFar == null) claimedSoFar = BigDecimal.ZERO;

        BigDecimal projectedTotal = claimedSoFar.add(request.amount());
        if (projectedTotal.compareTo(plan.getAnnualLimit()) > 0) {
            BigDecimal remaining = plan.getAnnualLimit().subtract(claimedSoFar);
            throw new DomainException("EXCEEDED_ANNUAL_LIMIT",
                    String.format("Claim of %s exceeds remaining annual limit %s for %s",
                            request.amount(), remaining, plan.getName()));
        }

        String claimNumber = "BEN-" + claimDate.format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        EmployeeBenefitClaim claim = new EmployeeBenefitClaim();
        claim.setEmployee(employee);
        claim.setBenefitPlan(plan);
        claim.setClaimNumber(claimNumber);
        claim.setClaimDate(claimDate);
        claim.setAmount(request.amount());
        claim.setDescription(request.description());
        claim.setReceiptUrl(request.receiptUrl());
        claim.setStatus("SUBMITTED");

        EmployeeBenefitClaim saved = claimRepository.save(claim);
        return mapClaimToResponse(saved);
    }

    public List<EmployeeBenefitClaimResponse> getClaims(UUID employeeId) {
        List<EmployeeBenefitClaim> claims = employeeId != null
                ? claimRepository.findByEmployeeIdOrderByClaimDateDesc(employeeId)
                : claimRepository.findAll();
        return claims.stream().map(this::mapClaimToResponse).collect(Collectors.toList());
    }

    public EmployeeBenefitClaimResponse getClaim(UUID id) {
        EmployeeBenefitClaim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefit claim not found with id: " + id));
        return mapClaimToResponse(claim);
    }

    public EmployeeBenefitClaimResponse updateClaimStatus(UUID id, BenefitClaimStatusUpdateRequest request) {
        EmployeeBenefitClaim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefit claim not found with id: " + id));

        claim.setStatus(request.status());
        if (request.reviewerId() != null) {
            employeeRepository.findById(request.reviewerId()).ifPresent(claim::setReviewedBy);
        }
        claim.setReviewedAt(Instant.now());
        if (request.rejectionReason() != null) {
            claim.setRejectionReason(request.rejectionReason());
        }

        EmployeeBenefitClaim saved = claimRepository.save(claim);
        return mapClaimToResponse(saved);
    }

    private BenefitPlanResponse mapPlanToResponse(BenefitPlan p) {
        return new BenefitPlanResponse(
                p.getId(),
                p.getCode(),
                p.getName(),
                p.getCategory(),
                p.getAnnualLimit(),
                p.getDescription(),
                p.getIsActive(),
                p.getCreatedAt()
        );
    }

    private EmployeeBenefitClaimResponse mapClaimToResponse(EmployeeBenefitClaim c) {
        String empName = c.getEmployee() != null ? c.getEmployee().getFirstName() + " " + (c.getEmployee().getLastName() != null ? c.getEmployee().getLastName() : "") : "";
        String empNum = c.getEmployee() != null ? c.getEmployee().getEmployeeNumber() : "";
        String reviewerName = c.getReviewedBy() != null ? c.getReviewedBy().getFirstName() + " " + (c.getReviewedBy().getLastName() != null ? c.getReviewedBy().getLastName() : "") : null;

        return new EmployeeBenefitClaimResponse(
                c.getId(),
                c.getEmployee() != null ? c.getEmployee().getId() : null,
                empName.trim(),
                empNum,
                c.getBenefitPlan() != null ? c.getBenefitPlan().getId() : null,
                c.getBenefitPlan() != null ? c.getBenefitPlan().getCode() : null,
                c.getBenefitPlan() != null ? c.getBenefitPlan().getName() : null,
                c.getBenefitPlan() != null ? c.getBenefitPlan().getCategory() : null,
                c.getClaimNumber(),
                c.getClaimDate(),
                c.getAmount(),
                c.getDescription(),
                c.getReceiptUrl(),
                c.getStatus(),
                reviewerName != null ? reviewerName.trim() : null,
                c.getReviewedAt(),
                c.getRejectionReason(),
                c.getCreatedAt()
        );
    }
}
