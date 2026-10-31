package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.organization.entity.Grade;
import com.ventura.hris.payroll.dto.EmployeeSalaryComponentItem;
import com.ventura.hris.payroll.dto.EmployeeSalaryProfileRequest;
import com.ventura.hris.payroll.dto.EmployeeSalaryProfileResponse;
import com.ventura.hris.payroll.entity.EmployeeSalaryComponent;
import com.ventura.hris.payroll.entity.EmployeeSalaryProfile;
import com.ventura.hris.payroll.entity.SalaryComponent;
import com.ventura.hris.payroll.entity.SalaryStructure;
import com.ventura.hris.payroll.repository.EmployeeSalaryComponentRepository;
import com.ventura.hris.payroll.repository.EmployeeSalaryProfileRepository;
import com.ventura.hris.payroll.repository.SalaryComponentRepository;
import com.ventura.hris.payroll.repository.SalaryStructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompensationService {

    private final EmployeeSalaryProfileRepository profileRepository;
    private final EmployeeSalaryComponentRepository empCompRepository;
    private final SalaryComponentRepository salaryCompRepository;
    private final SalaryStructureRepository structureRepository;
    private final EmployeeRepository employeeRepository;

    public CompensationService(
            EmployeeSalaryProfileRepository profileRepository,
            EmployeeSalaryComponentRepository empCompRepository,
            SalaryComponentRepository salaryCompRepository,
            SalaryStructureRepository structureRepository,
            EmployeeRepository employeeRepository
    ) {
        this.profileRepository = profileRepository;
        this.empCompRepository = empCompRepository;
        this.salaryCompRepository = salaryCompRepository;
        this.structureRepository = structureRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public EmployeeSalaryProfileResponse getEmployeeSalaryProfile(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        EmployeeSalaryProfile profile = profileRepository.findByEmployeeId(employeeId).orElse(null);
        return buildProfileResponse(employee, profile);
    }

    @Transactional
    public EmployeeSalaryProfileResponse saveOrUpdateEmployeeSalaryProfile(UUID employeeId, EmployeeSalaryProfileRequest req) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        EmployeeSalaryProfile profile = profileRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    EmployeeSalaryProfile p = new EmployeeSalaryProfile();
                    p.setEmployee(employee);
                    return p;
                });

        profile.setBasicSalary(req.getBasicSalary() != null ? req.getBasicSalary() : BigDecimal.ZERO);
        profile.setCurrency(req.getCurrency() != null ? req.getCurrency() : "IDR");
        profile.setEffectiveDate(req.getEffectiveDate());
        profile.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "BANK_TRANSFER");
        profile.setBankName(req.getBankName());
        profile.setBankAccountNumber(req.getBankAccountNumber());
        profile.setBankAccountHolder(req.getBankAccountHolder());
        profile.setTaxStatus(req.getTaxStatus() != null ? req.getTaxStatus() : "TK/0");

        EmployeeSalaryProfile savedProfile = profileRepository.save(profile);

        // Update components
        List<EmployeeSalaryComponent> existing = empCompRepository.findByProfileId(savedProfile.getId());
        if (!existing.isEmpty()) {
            empCompRepository.deleteAll(existing);
            empCompRepository.flush();
        }

        if (req.getComponents() != null && !req.getComponents().isEmpty()) {
            List<EmployeeSalaryComponent> toSave = new ArrayList<>();
            for (EmployeeSalaryComponentItem item : req.getComponents()) {
                SalaryComponent sc = salaryCompRepository.findById(item.getComponentId())
                        .orElseThrow(() -> new ResourceNotFoundException("SalaryComponent", item.getComponentId()));

                toSave.add(new EmployeeSalaryComponent(savedProfile, sc, item.getAmount()));
            }
            empCompRepository.saveAll(toSave);
        }

        return buildProfileResponse(employee, savedProfile);
    }

    private EmployeeSalaryProfileResponse buildProfileResponse(Employee employee, EmployeeSalaryProfile profile) {
        EmployeeSalaryProfileResponse res = new EmployeeSalaryProfileResponse();
        res.setEmployeeId(employee.getId());
        res.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        res.setEmployeeNumber(employee.getEmployeeNumber());

        Grade grade = employee.getGrade();
        if (grade != null) {
            res.setGradeId(grade.getId());
            res.setGradeName(grade.getName());

            Optional<SalaryStructure> structureOpt = structureRepository.findByGradeId(grade.getId());
            if (structureOpt.isPresent()) {
                SalaryStructure struct = structureOpt.get();
                res.setGradeMinSalary(struct.getMinSalary());
                res.setGradeMaxSalary(struct.getMaxSalary());

                if (profile != null && profile.getBasicSalary() != null) {
                    boolean within = profile.getBasicSalary().compareTo(struct.getMinSalary()) >= 0
                            && profile.getBasicSalary().compareTo(struct.getMaxSalary()) <= 0;
                    res.setIsWithinGradeRange(within);
                }
            }
        }

        if (profile != null) {
            res.setId(profile.getId());
            res.setBasicSalary(profile.getBasicSalary());
            res.setCurrency(profile.getCurrency());
            res.setEffectiveDate(profile.getEffectiveDate());
            res.setPaymentMethod(profile.getPaymentMethod());
            res.setBankName(profile.getBankName());
            res.setBankAccountNumber(profile.getBankAccountNumber());
            res.setBankAccountHolder(profile.getBankAccountHolder());
            res.setTaxStatus(profile.getTaxStatus());
            res.setCreatedAt(profile.getCreatedAt());
            res.setUpdatedAt(profile.getUpdatedAt());

            BigDecimal totalAllowances = BigDecimal.ZERO;
            BigDecimal totalDeductions = BigDecimal.ZERO;
            List<EmployeeSalaryComponentItem> compItems = new ArrayList<>();

            List<EmployeeSalaryComponent> compList = empCompRepository.findByProfileId(profile.getId());
            for (EmployeeSalaryComponent esc : compList) {
                SalaryComponent sc = esc.getComponent();
                compItems.add(new EmployeeSalaryComponentItem(
                        sc.getId(),
                        sc.getCode(),
                        sc.getName(),
                        sc.getType(),
                        esc.getAmount()
                ));

                if (sc.getType() != null && sc.getType().startsWith("EARNING")) {
                    totalAllowances = totalAllowances.add(esc.getAmount());
                } else if (sc.getType() != null && sc.getType().startsWith("DEDUCTION")) {
                    totalDeductions = totalDeductions.add(esc.getAmount());
                }
            }

            res.setComponents(compItems);
            res.setTotalFixedAllowances(totalAllowances);
            res.setTotalFixedDeductions(totalDeductions);

            BigDecimal grossTakeHome = profile.getBasicSalary().add(totalAllowances).subtract(totalDeductions);
            res.setTotalTakeHomePay(grossTakeHome.compareTo(BigDecimal.ZERO) > 0 ? grossTakeHome : BigDecimal.ZERO);
        }

        return res;
    }
}
