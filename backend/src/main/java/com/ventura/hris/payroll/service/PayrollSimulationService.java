package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.payroll.dto.PayrollSimulationResponse;
import com.ventura.hris.payroll.dto.TaxCalculationRequest;
import com.ventura.hris.payroll.dto.TaxCalculationResponse;
import com.ventura.hris.payroll.entity.*;
import com.ventura.hris.payroll.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayrollSimulationService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollAttendanceCutoffRepository cutoffRepository;
    private final EmployeeSalaryProfileRepository profileRepository;
    private final EmployeeSalaryComponentRepository empCompRepository;
    private final PayrollSimulationRepository simulationRepository;
    private final TaxConfigurationService taxService;
    private final PayrollAttendanceIntegrationService attendanceIntegrationService;

    public PayrollSimulationService(
            PayrollPeriodRepository periodRepository,
            PayrollAttendanceCutoffRepository cutoffRepository,
            EmployeeSalaryProfileRepository profileRepository,
            EmployeeSalaryComponentRepository empCompRepository,
            PayrollSimulationRepository simulationRepository,
            TaxConfigurationService taxService,
            PayrollAttendanceIntegrationService attendanceIntegrationService
    ) {
        this.periodRepository = periodRepository;
        this.cutoffRepository = cutoffRepository;
        this.profileRepository = profileRepository;
        this.empCompRepository = empCompRepository;
        this.simulationRepository = simulationRepository;
        this.taxService = taxService;
        this.attendanceIntegrationService = attendanceIntegrationService;
    }

    @Transactional(readOnly = true)
    public List<PayrollSimulationResponse> getSimulations(UUID periodId) {
        return simulationRepository.findByPeriodId(periodId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PayrollSimulationResponse> simulatePeriod(UUID periodId) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", periodId));

        // Ensure attendance cutoffs are ingested
        List<PayrollAttendanceCutoff> cutoffs = cutoffRepository.findByPeriodId(periodId);
        if (cutoffs.isEmpty()) {
            attendanceIntegrationService.ingestAttendanceForPeriod(periodId);
            cutoffs = cutoffRepository.findByPeriodId(periodId);
        }

        List<PayrollSimulation> simulations = new ArrayList<>();

        for (PayrollAttendanceCutoff cutoff : cutoffs) {
            Employee emp = cutoff.getEmployee();
            Optional<EmployeeSalaryProfile> profileOpt = profileRepository.findByEmployeeId(emp.getId());

            BigDecimal basicSalary = profileOpt.map(EmployeeSalaryProfile::getBasicSalary).orElse(BigDecimal.ZERO);
            String taxStatus = profileOpt.map(EmployeeSalaryProfile::getTaxStatus).orElse("TK/0");

            // Calculate allowances and deductions
            BigDecimal fixedAllowances = BigDecimal.ZERO;
            BigDecimal fixedDeductions = BigDecimal.ZERO;

            if (profileOpt.isPresent()) {
                List<EmployeeSalaryComponent> comps = empCompRepository.findByProfileId(profileOpt.get().getId());
                for (EmployeeSalaryComponent esc : comps) {
                    SalaryComponent sc = esc.getComponent();
                    if (sc.getType() != null && sc.getType().startsWith("EARNING")) {
                        fixedAllowances = fixedAllowances.add(esc.getAmount());
                    } else if (sc.getType() != null && sc.getType().startsWith("DEDUCTION")) {
                        fixedDeductions = fixedDeductions.add(esc.getAmount());
                    }
                }
            }

            // Proration formula
            BigDecimal prorationFactor = BigDecimal.ONE;
            if (emp.getHireDate() != null && emp.getHireDate().isAfter(period.getStartDate()) && !emp.getHireDate().isAfter(period.getEndDate())) {
                long totalDaysInPeriod = ChronoUnit.DAYS.between(period.getStartDate(), period.getEndDate()) + 1;
                long activeDays = ChronoUnit.DAYS.between(emp.getHireDate(), period.getEndDate()) + 1;
                if (totalDaysInPeriod > 0) {
                    prorationFactor = BigDecimal.valueOf(activeDays).divide(BigDecimal.valueOf(totalDaysInPeriod), 4, RoundingMode.HALF_UP);
                }
            }

            BigDecimal proratedBasic = basicSalary.multiply(prorationFactor).setScale(2, RoundingMode.HALF_UP);
            BigDecimal overtimeEarnings = cutoff.getOvertimePayAmount();
            BigDecimal attendanceDeductions = cutoff.getUnpaidLeaveDeductionAmount().add(cutoff.getLateFineAmount());
            BigDecimal grossSalary = proratedBasic.add(fixedAllowances).add(overtimeEarnings);

            // Estimate Monthly PPh 21 Withholding Tax
            BigDecimal annualizedGross = grossSalary.multiply(BigDecimal.valueOf(12));
            TaxCalculationResponse taxCalc = taxService.calculateProgressiveTax(
                    new TaxCalculationRequest(annualizedGross, taxStatus, period.getStartDate().getYear())
            );
            BigDecimal monthlyTax = taxCalc.getMonthlyTaxAmount();

            BigDecimal totalAllDeductions = attendanceDeductions.add(fixedDeductions).add(monthlyTax);
            BigDecimal netSalary = grossSalary.subtract(totalAllDeductions);
            if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
                netSalary = BigDecimal.ZERO;
            }

            // Discrepancy checks
            boolean hasDiscrepancies = false;
            StringBuilder notes = new StringBuilder();

            if (cutoff.getAbsentDays() > 3) {
                hasDiscrepancies = true;
                notes.append("Excessive absent days (").append(cutoff.getAbsentDays()).append("). ");
            }
            if (cutoff.getLateMinutes() > 180) {
                hasDiscrepancies = true;
                notes.append("Excessive tardiness (").append(cutoff.getLateMinutes()).append(" min). ");
            }
            if (basicSalary.compareTo(BigDecimal.ZERO) == 0) {
                hasDiscrepancies = true;
                notes.append("No basic salary configured in profile. ");
            }

            PayrollSimulation sim = simulationRepository.findByPeriodIdAndEmployeeId(period.getId(), emp.getId())
                    .orElseGet(() -> {
                        PayrollSimulation s = new PayrollSimulation();
                        s.setPeriod(period);
                        s.setEmployee(emp);
                        return s;
                    });

            sim.setBasicSalary(basicSalary);
            sim.setProrationFactor(prorationFactor);
            sim.setProratedBasicSalary(proratedBasic);
            sim.setFixedAllowances(fixedAllowances);
            sim.setOvertimeEarnings(overtimeEarnings);
            sim.setAttendanceDeductions(attendanceDeductions);
            sim.setFixedDeductions(fixedDeductions);
            sim.setTaxDeduction(monthlyTax);
            sim.setGrossSalary(grossSalary);
            sim.setNetSalary(netSalary);
            sim.setHasDiscrepancies(hasDiscrepancies);
            sim.setDiscrepancyNote(notes.length() > 0 ? notes.toString().trim() : null);
            sim.setStatus("SIMULATED");

            simulations.add(simulationRepository.save(sim));
        }

        return simulations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PayrollSimulationResponse mapToResponse(PayrollSimulation s) {
        PayrollSimulationResponse res = new PayrollSimulationResponse();
        res.setId(s.getId());
        res.setPeriodId(s.getPeriod().getId());
        res.setEmployeeId(s.getEmployee().getId());
        res.setEmployeeName(s.getEmployee().getFirstName() + " " + s.getEmployee().getLastName());
        res.setEmployeeNumber(s.getEmployee().getEmployeeNumber());
        res.setBasicSalary(s.getBasicSalary());
        res.setProrationFactor(s.getProrationFactor());
        res.setProratedBasicSalary(s.getProratedBasicSalary());
        res.setFixedAllowances(s.getFixedAllowances());
        res.setOvertimeEarnings(s.getOvertimeEarnings());
        res.setAttendanceDeductions(s.getAttendanceDeductions());
        res.setFixedDeductions(s.getFixedDeductions());
        res.setTaxDeduction(s.getTaxDeduction());
        res.setGrossSalary(s.getGrossSalary());
        res.setNetSalary(s.getNetSalary());
        res.setHasDiscrepancies(s.getHasDiscrepancies());
        res.setDiscrepancyNote(s.getDiscrepancyNote());
        res.setStatus(s.getStatus());
        return res;
    }
}
