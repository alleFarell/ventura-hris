package com.ventura.hris.payroll.service;

import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import com.ventura.hris.attendance.repository.MonthlyAttendanceRecapRepository;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.PayrollAttendanceCutoffResponse;
import com.ventura.hris.payroll.entity.EmployeeSalaryProfile;
import com.ventura.hris.payroll.entity.PayrollAttendanceCutoff;
import com.ventura.hris.payroll.entity.PayrollPeriod;
import com.ventura.hris.payroll.repository.EmployeeSalaryProfileRepository;
import com.ventura.hris.payroll.repository.PayrollAttendanceCutoffRepository;
import com.ventura.hris.payroll.repository.PayrollPeriodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayrollAttendanceIntegrationService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollAttendanceCutoffRepository cutoffRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryProfileRepository profileRepository;
    private final MonthlyAttendanceRecapRepository recapRepository;

    public PayrollAttendanceIntegrationService(
            PayrollPeriodRepository periodRepository,
            PayrollAttendanceCutoffRepository cutoffRepository,
            EmployeeRepository employeeRepository,
            EmployeeSalaryProfileRepository profileRepository,
            MonthlyAttendanceRecapRepository recapRepository
    ) {
        this.periodRepository = periodRepository;
        this.cutoffRepository = cutoffRepository;
        this.employeeRepository = employeeRepository;
        this.profileRepository = profileRepository;
        this.recapRepository = recapRepository;
    }

    @Transactional(readOnly = true)
    public List<PayrollAttendanceCutoffResponse> getAttendanceCutoffs(UUID periodId) {
        return cutoffRepository.findByPeriodId(periodId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PayrollAttendanceCutoffResponse> ingestAttendanceForPeriod(UUID periodId) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", periodId));

        int year = period.getStartDate().getYear();
        int month = period.getStartDate().getMonthValue();

        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getEmploymentStatus() == EmploymentStatus.ACTIVE)
                .toList();

        List<PayrollAttendanceCutoff> cutoffsToSave = new ArrayList<>();

        for (Employee emp : employees) {
            Optional<MonthlyAttendanceRecap> recapOpt = recapRepository.findByEmployeeIdAndPeriodYearAndPeriodMonth(
                    emp.getId(), year, month
            );

            int totalWorkdays = period.getTotalStandardWorkdays();
            int presentDays = recapOpt.map(MonthlyAttendanceRecap::getTotalDaysPresent).orElse(totalWorkdays);
            int absentDays = recapOpt.map(MonthlyAttendanceRecap::getTotalDaysAbsent).orElse(0);
            int unpaidLeaveDays = recapOpt.map(MonthlyAttendanceRecap::getTotalUnpaidLeaveDays).orElse(0);
            int lateMinutes = recapOpt.map(MonthlyAttendanceRecap::getTotalLateMinutes).orElse(0);
            BigDecimal overtimeHours = recapOpt.map(MonthlyAttendanceRecap::getTotalOvertimeHours).orElse(BigDecimal.ZERO);

            BigDecimal basicSalary = profileRepository.findByEmployeeId(emp.getId())
                    .map(EmployeeSalaryProfile::getBasicSalary)
                    .orElse(BigDecimal.ZERO);

            // Statutory calculation rates:
            // Hourly base = basicSalary / 173
            // Daily base = basicSalary / totalWorkdays
            BigDecimal hourlyRate = basicSalary.compareTo(BigDecimal.ZERO) > 0
                    ? basicSalary.divide(BigDecimal.valueOf(173), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal dailyRate = (basicSalary.compareTo(BigDecimal.ZERO) > 0 && totalWorkdays > 0)
                    ? basicSalary.divide(BigDecimal.valueOf(totalWorkdays), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal overtimePay = overtimeHours.multiply(hourlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal unpaidLeaveCut = dailyRate.multiply(BigDecimal.valueOf(absentDays + unpaidLeaveDays)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lateFine = lateMinutes > 30
                    ? hourlyRate.multiply(BigDecimal.valueOf(lateMinutes)).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            PayrollAttendanceCutoff cutoff = cutoffRepository.findByPeriodIdAndEmployeeId(period.getId(), emp.getId())
                    .orElseGet(() -> {
                        PayrollAttendanceCutoff c = new PayrollAttendanceCutoff();
                        c.setPeriod(period);
                        c.setEmployee(emp);
                        return c;
                    });

            cutoff.setTotalWorkdays(totalWorkdays);
            cutoff.setPresentDays(presentDays);
            cutoff.setAbsentDays(absentDays);
            cutoff.setUnpaidLeaveDays(unpaidLeaveDays);
            cutoff.setLateMinutes(lateMinutes);
            cutoff.setOvertimeHours(overtimeHours);
            cutoff.setOvertimePayAmount(overtimePay);
            cutoff.setUnpaidLeaveDeductionAmount(unpaidLeaveCut);
            cutoff.setLateFineAmount(lateFine);
            cutoff.setIsSynced(true);

            cutoffsToSave.add(cutoffRepository.save(cutoff));
        }

        return cutoffsToSave.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PayrollAttendanceCutoffResponse mapToResponse(PayrollAttendanceCutoff c) {
        PayrollAttendanceCutoffResponse res = new PayrollAttendanceCutoffResponse();
        res.setId(c.getId());
        res.setPeriodId(c.getPeriod().getId());
        res.setEmployeeId(c.getEmployee().getId());
        res.setEmployeeName(c.getEmployee().getFirstName() + " " + c.getEmployee().getLastName());
        res.setEmployeeNumber(c.getEmployee().getEmployeeNumber());
        res.setTotalWorkdays(c.getTotalWorkdays());
        res.setPresentDays(c.getPresentDays());
        res.setAbsentDays(c.getAbsentDays());
        res.setUnpaidLeaveDays(c.getUnpaidLeaveDays());
        res.setLateMinutes(c.getLateMinutes());
        res.setOvertimeHours(c.getOvertimeHours());
        res.setOvertimePayAmount(c.getOvertimePayAmount());
        res.setUnpaidLeaveDeductionAmount(c.getUnpaidLeaveDeductionAmount());
        res.setLateFineAmount(c.getLateFineAmount());
        res.setTotalAttendanceDeductions(c.getUnpaidLeaveDeductionAmount().add(c.getLateFineAmount()));
        res.setIsSynced(c.getIsSynced());
        return res;
    }
}
