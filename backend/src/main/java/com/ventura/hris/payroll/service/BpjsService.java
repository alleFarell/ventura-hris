package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.entity.BpjsConfiguration;
import com.ventura.hris.payroll.entity.EmployeeBpjsEnrollment;
import com.ventura.hris.payroll.repository.BpjsConfigurationRepository;
import com.ventura.hris.payroll.repository.EmployeeBpjsEnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BpjsService {

    private final BpjsConfigurationRepository bpjsConfigurationRepository;
    private final EmployeeBpjsEnrollmentRepository enrollmentRepository;
    private final EmployeeRepository employeeRepository;

    private static final Map<Integer, BigDecimal> JKK_GRADE_RATES = Map.of(
            1, new BigDecimal("0.0024"),
            2, new BigDecimal("0.0054"),
            3, new BigDecimal("0.0089"),
            4, new BigDecimal("0.0127"),
            5, new BigDecimal("0.0174")
    );

    public BpjsService(BpjsConfigurationRepository bpjsConfigurationRepository,
                       EmployeeBpjsEnrollmentRepository enrollmentRepository,
                       EmployeeRepository employeeRepository) {
        this.bpjsConfigurationRepository = bpjsConfigurationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<BpjsConfigurationResponse> getAllConfigurations() {
        seedDefaultsIfNeeded();
        return bpjsConfigurationRepository.findAll().stream()
                .map(this::mapConfigToResponse)
                .collect(Collectors.toList());
    }

    private void seedDefaultsIfNeeded() {
        if (bpjsConfigurationRepository.count() == 0) {
            List<BpjsConfiguration> defaults = List.of(
                    createConfig("BPJS_KESEHATAN", new BigDecimal("0.0400"), new BigDecimal("0.0100"), new BigDecimal("12000000.00"), "BPJS Kesehatan standard rate (4% employer, 1% employee, cap 12M)"),
                    createConfig("BPJS_TK_JKK", new BigDecimal("0.0024"), BigDecimal.ZERO, null, "BPJS Ketenagakerjaan JKK (0.24% default risk grade 1)"),
                    createConfig("BPJS_TK_JKM", new BigDecimal("0.0030"), BigDecimal.ZERO, null, "BPJS Ketenagakerjaan JKM (0.30% employer)"),
                    createConfig("BPJS_TK_JHT", new BigDecimal("0.0370"), new BigDecimal("0.0200"), null, "BPJS Ketenagakerjaan JHT (3.7% employer, 2.0% employee)"),
                    createConfig("BPJS_TK_JP", new BigDecimal("0.0200"), new BigDecimal("0.0100"), new BigDecimal("10042300.00"), "BPJS Ketenagakerjaan JP (2% employer, 1% employee, cap 10.04M)")
            );
            bpjsConfigurationRepository.saveAll(defaults);
        }
    }

    private BpjsConfiguration createConfig(String type, BigDecimal erRate, BigDecimal eeRate, BigDecimal ceiling, String desc) {
        BpjsConfiguration c = new BpjsConfiguration();
        c.setProgramType(type);
        c.setEmployerRate(erRate);
        c.setEmployeeRate(eeRate);
        c.setWageCeiling(ceiling);
        c.setDescription(desc);
        c.setIsActive(true);
        return c;
    }

    public BpjsConfigurationResponse getConfiguration(UUID id) {
        BpjsConfiguration config = bpjsConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BPJS configuration not found with id: " + id));
        return mapConfigToResponse(config);
    }

    public BpjsConfigurationResponse updateConfiguration(UUID id, BpjsConfigurationUpdateRequest request) {
        BpjsConfiguration config = bpjsConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BPJS configuration not found with id: " + id));

        config.setEmployerRate(request.employerRate());
        config.setEmployeeRate(request.employeeRate());
        config.setWageCeiling(request.wageCeiling());
        config.setWageFloor(request.wageFloor());
        if (request.description() != null) config.setDescription(request.description());
        if (request.isActive() != null) config.setIsActive(request.isActive());

        BpjsConfiguration saved = bpjsConfigurationRepository.save(config);
        return mapConfigToResponse(saved);
    }

    public EmployeeBpjsEnrollmentResponse enrollEmployee(EmployeeBpjsEnrollmentRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));

        EmployeeBpjsEnrollment enrollment = enrollmentRepository.findByEmployeeId(request.employeeId())
                .orElse(new EmployeeBpjsEnrollment());

        enrollment.setEmployee(employee);
        enrollment.setBpjsKesNumber(request.bpjsKesNumber());
        enrollment.setBpjsTkNumber(request.bpjsTkNumber());
        if (request.jkkRiskGrade() != null) {
            enrollment.setJkkRiskGrade(request.jkkRiskGrade());
        }
        if (request.isKesActive() != null) {
            enrollment.setIsKesActive(request.isKesActive());
        }
        if (request.isTkActive() != null) {
            enrollment.setIsTkActive(request.isTkActive());
        }

        EmployeeBpjsEnrollment saved = enrollmentRepository.save(enrollment);
        return mapEnrollmentToResponse(saved);
    }

    public EmployeeBpjsEnrollmentResponse getEnrollmentByEmployee(UUID employeeId) {
        EmployeeBpjsEnrollment enrollment = enrollmentRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("BPJS enrollment not found for employee: " + employeeId));
        return mapEnrollmentToResponse(enrollment);
    }

    public List<BpjsCalculationResult> calculateBpjs(BigDecimal baseWage, Integer jkkRiskGrade) {
        seedDefaultsIfNeeded();
        List<BpjsConfiguration> configs = bpjsConfigurationRepository.findByIsActiveTrue();
        List<BpjsCalculationResult> results = new ArrayList<>();

        for (BpjsConfiguration config : configs) {
            BigDecimal wage = baseWage;
            if (config.getWageCeiling() != null && wage.compareTo(config.getWageCeiling()) > 0) {
                wage = config.getWageCeiling();
            }

            BigDecimal employerRate = config.getEmployerRate();
            if ("BPJS_TK_JKK".equals(config.getProgramType()) && jkkRiskGrade != null && JKK_GRADE_RATES.containsKey(jkkRiskGrade)) {
                employerRate = JKK_GRADE_RATES.get(jkkRiskGrade);
            }

            BigDecimal employeeRate = config.getEmployeeRate();
            BigDecimal employerAmount = wage.multiply(employerRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal employeeAmount = wage.multiply(employeeRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = employerAmount.add(employeeAmount);

            results.add(new BpjsCalculationResult(
                    config.getProgramType(),
                    wage,
                    employerRate,
                    employeeRate,
                    employerAmount,
                    employeeAmount,
                    totalAmount
            ));
        }

        return results;
    }

    private BpjsConfigurationResponse mapConfigToResponse(BpjsConfiguration c) {
        return new BpjsConfigurationResponse(
                c.getId(),
                c.getProgramType(),
                c.getEmployerRate(),
                c.getEmployeeRate(),
                c.getWageCeiling(),
                c.getWageFloor(),
                c.getDescription(),
                c.getIsActive(),
                c.getUpdatedAt()
        );
    }

    private EmployeeBpjsEnrollmentResponse mapEnrollmentToResponse(EmployeeBpjsEnrollment e) {
        String empName = e.getEmployee() != null ? e.getEmployee().getFirstName() + " " + (e.getEmployee().getLastName() != null ? e.getEmployee().getLastName() : "") : "";
        String empNum = e.getEmployee() != null ? e.getEmployee().getEmployeeNumber() : "";
        return new EmployeeBpjsEnrollmentResponse(
                e.getId(),
                e.getEmployee() != null ? e.getEmployee().getId() : null,
                empName.trim(),
                empNum,
                e.getBpjsKesNumber(),
                e.getBpjsTkNumber(),
                e.getJkkRiskGrade(),
                e.getIsKesActive(),
                e.getIsTkActive(),
                e.getUpdatedAt()
        );
    }
}
