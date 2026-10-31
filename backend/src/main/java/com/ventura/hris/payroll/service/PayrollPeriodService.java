package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.payroll.dto.PayrollPeriodCreateRequest;
import com.ventura.hris.payroll.dto.PayrollPeriodResponse;
import com.ventura.hris.payroll.entity.PayrollPeriod;
import com.ventura.hris.payroll.entity.PayrollSimulation;
import com.ventura.hris.payroll.repository.PayrollAttendanceCutoffRepository;
import com.ventura.hris.payroll.repository.PayrollPeriodRepository;
import com.ventura.hris.payroll.repository.PayrollSimulationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayrollPeriodService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollAttendanceCutoffRepository cutoffRepository;
    private final PayrollSimulationRepository simulationRepository;

    public PayrollPeriodService(
            PayrollPeriodRepository periodRepository,
            PayrollAttendanceCutoffRepository cutoffRepository,
            PayrollSimulationRepository simulationRepository
    ) {
        this.periodRepository = periodRepository;
        this.cutoffRepository = cutoffRepository;
        this.simulationRepository = simulationRepository;
    }

    @Transactional(readOnly = true)
    public List<PayrollPeriodResponse> getAllPeriods() {
        return periodRepository.findAllByOrderByStartDateDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayrollPeriodResponse getPeriodById(UUID id) {
        PayrollPeriod p = periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", id));
        return mapToResponse(p);
    }

    @Transactional
    public PayrollPeriodResponse createPeriod(PayrollPeriodCreateRequest req) {
        if (periodRepository.existsByCodeIgnoreCase(req.getCode().trim())) {
            throw new DomainException("DUPLICATE_RESOURCE", "Payroll period with code '" + req.getCode() + "' already exists", HttpStatus.CONFLICT);
        }
        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new DomainException("INVALID_DATE_RANGE", "Start date cannot be after end date");
        }

        PayrollPeriod p = new PayrollPeriod(
                req.getCode().trim().toUpperCase(),
                req.getName().trim(),
                req.getStartDate(),
                req.getEndDate(),
                req.getAttendanceCutoffDate(),
                req.getPayoutDate(),
                req.getTotalStandardWorkdays()
        );

        PayrollPeriod saved = periodRepository.save(p);
        return mapToResponse(saved);
    }

    @Transactional
    public PayrollPeriodResponse updateStatus(UUID id, String status) {
        PayrollPeriod p = periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", id));

        p.setStatus(status.trim().toUpperCase());
        PayrollPeriod saved = periodRepository.save(p);
        return mapToResponse(saved);
    }

    public PayrollPeriodResponse mapToResponse(PayrollPeriod p) {
        PayrollPeriodResponse res = new PayrollPeriodResponse();
        res.setId(p.getId());
        res.setCode(p.getCode());
        res.setName(p.getName());
        res.setStartDate(p.getStartDate());
        res.setEndDate(p.getEndDate());
        res.setAttendanceCutoffDate(p.getAttendanceCutoffDate());
        res.setPayoutDate(p.getPayoutDate());
        res.setStatus(p.getStatus());
        res.setTotalStandardWorkdays(p.getTotalStandardWorkdays());
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());

        List<PayrollSimulation> sims = simulationRepository.findByPeriodId(p.getId());
        res.setTotalEmployeesIngested(sims.size());

        BigDecimal totalGross = sims.stream().map(PayrollSimulation::getGrossSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = sims.stream().map(PayrollSimulation::getNetSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
        res.setTotalSimulatedGross(totalGross);
        res.setTotalSimulatedNet(totalNet);

        return res;
    }
}
