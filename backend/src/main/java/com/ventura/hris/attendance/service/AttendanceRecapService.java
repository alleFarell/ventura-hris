package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.MonthlyAttendanceRecapResponse;
import com.ventura.hris.attendance.entity.AttendanceRecord;
import com.ventura.hris.attendance.entity.CompanyHoliday;
import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import com.ventura.hris.attendance.entity.OvertimeRequest;
import com.ventura.hris.attendance.repository.AttendanceRecordRepository;
import com.ventura.hris.attendance.repository.CompanyHolidayRepository;
import com.ventura.hris.attendance.repository.MonthlyAttendanceRecapRepository;
import com.ventura.hris.attendance.repository.OvertimeRequestRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.leave.entity.LeaveRequest;
import com.ventura.hris.leave.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceRecapService {

    private final MonthlyAttendanceRecapRepository recapRepository;
    private final AttendanceRecordRepository recordRepository;
    private final OvertimeRequestRepository overtimeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final CompanyHolidayRepository holidayRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceRecapService(
            MonthlyAttendanceRecapRepository recapRepository,
            AttendanceRecordRepository recordRepository,
            OvertimeRequestRepository overtimeRepository,
            LeaveRequestRepository leaveRequestRepository,
            CompanyHolidayRepository holidayRepository,
            EmployeeRepository employeeRepository
    ) {
        this.recapRepository = recapRepository;
        this.recordRepository = recordRepository;
        this.overtimeRepository = overtimeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.holidayRepository = holidayRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<MonthlyAttendanceRecapResponse> generateMonthlyRecap(Integer year, Integer month) {
        if (month < 1 || month > 12) {
            throw new DomainException("INVALID_MONTH", "Month must be between 1 and 12");
        }

        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        List<CompanyHoliday> holidays = holidayRepository.findByHolidayDateBetweenOrderByHolidayDateAsc(firstDay, lastDay);
        Set<LocalDate> holidayDates = holidays.stream().map(CompanyHoliday::getHolidayDate).collect(Collectors.toSet());

        int totalWorkingDays = 0;
        LocalDate curr = firstDay;
        while (!curr.isAfter(lastDay)) {
            DayOfWeek dow = curr.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY && !holidayDates.contains(curr)) {
                totalWorkingDays++;
            }
            curr = curr.plusDays(1);
        }

        List<Employee> employees = employeeRepository.findAll();
        List<MonthlyAttendanceRecap> savedRecaps = new ArrayList<>();

        for (Employee employee : employees) {
            MonthlyAttendanceRecap recap = recapRepository
                    .findByEmployeeIdAndPeriodYearAndPeriodMonth(employee.getId(), year, month)
                    .orElseGet(() -> {
                        MonthlyAttendanceRecap r = new MonthlyAttendanceRecap();
                        r.setEmployee(employee);
                        r.setPeriodYear(year);
                        r.setPeriodMonth(month);
                        return r;
                    });

            if ("LOCKED_FOR_PAYROLL".equalsIgnoreCase(recap.getStatus())) {
                savedRecaps.add(recap);
                continue;
            }

            List<AttendanceRecord> records = recordRepository
                    .findByEmployeeIdAndRecordDateBetweenOrderByRecordDateAsc(employee.getId(), firstDay, lastDay);

            int presentDays = 0;
            int lateMins = 0;
            int earlyMins = 0;

            for (AttendanceRecord rec : records) {
                if ("PRESENT".equalsIgnoreCase(rec.getStatus())
                        || "LATE".equalsIgnoreCase(rec.getStatus())
                        || "EARLY_DEPARTURE".equalsIgnoreCase(rec.getStatus())) {
                    presentDays++;
                }
                if (rec.getLateMinutes() != null) lateMins += rec.getLateMinutes();
                if (rec.getEarlyDepartureMinutes() != null) earlyMins += rec.getEarlyDepartureMinutes();
            }

            List<OvertimeRequest> ots = overtimeRepository
                    .findByEmployeeIdAndOvertimeDateBetweenAndStatus(employee.getId(), firstDay, lastDay, "APPROVED");

            BigDecimal totalOtHours = BigDecimal.ZERO;
            for (OvertimeRequest ot : ots) {
                if (ot.getMultiplierHours() != null) {
                    totalOtHours = totalOtHours.add(ot.getMultiplierHours());
                }
            }

            List<LeaveRequest> leaves = leaveRequestRepository.findApprovedInDateRange(firstDay, lastDay).stream()
                    .filter(l -> l.getEmployee().getId().equals(employee.getId()))
                    .collect(Collectors.toList());

            int paidLeaves = 0;
            int unpaidLeaves = 0;
            for (LeaveRequest leave : leaves) {
                if (Boolean.TRUE.equals(leave.getLeaveType().getIsPaid())) {
                    paidLeaves += leave.getTotalDays();
                } else {
                    unpaidLeaves += leave.getTotalDays();
                }
            }

            int absentDays = Math.max(0, totalWorkingDays - presentDays - paidLeaves - unpaidLeaves);

            recap.setTotalWorkingDays(totalWorkingDays);
            recap.setTotalDaysPresent(presentDays);
            recap.setTotalDaysAbsent(absentDays);
            recap.setTotalLateMinutes(lateMins);
            recap.setTotalEarlyDepartureMinutes(earlyMins);
            recap.setTotalOvertimeHours(totalOtHours);
            recap.setTotalPaidLeaveDays(paidLeaves);
            recap.setTotalUnpaidLeaveDays(unpaidLeaves);
            if (recap.getStatus() == null || "DRAFT".equalsIgnoreCase(recap.getStatus())) {
                recap.setStatus("VERIFIED");
            }

            savedRecaps.add(recapRepository.save(recap));
        }

        return savedRecaps.stream().map(MonthlyAttendanceRecapResponse::fromEntity).collect(Collectors.toList());
    }

    public MonthlyAttendanceRecapResponse lockRecap(UUID id, UUID lockedBy) {
        MonthlyAttendanceRecap recap = recapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MonthlyAttendanceRecap", id));

        if ("LOCKED_FOR_PAYROLL".equalsIgnoreCase(recap.getStatus())) {
            throw new DomainException("ALREADY_LOCKED", "Monthly attendance recap is already locked for payroll");
        }

        recap.setStatus("LOCKED_FOR_PAYROLL");
        recap.setLockedAt(Instant.now());
        recap.setLockedBy(lockedBy);
        return MonthlyAttendanceRecapResponse.fromEntity(recapRepository.save(recap));
    }

    public List<MonthlyAttendanceRecapResponse> lockAllForPeriod(Integer year, Integer month, UUID lockedBy) {
        List<MonthlyAttendanceRecap> list = recapRepository.findByPeriodYearAndPeriodMonth(year, month);
        for (MonthlyAttendanceRecap recap : list) {
            if (!"LOCKED_FOR_PAYROLL".equalsIgnoreCase(recap.getStatus())) {
                recap.setStatus("LOCKED_FOR_PAYROLL");
                recap.setLockedAt(Instant.now());
                recap.setLockedBy(lockedBy);
                recapRepository.save(recap);
            }
        }
        return list.stream().map(MonthlyAttendanceRecapResponse::fromEntity).collect(Collectors.toList());
    }

    public List<MonthlyAttendanceRecapResponse> getRecaps(Integer year, Integer month) {
        List<MonthlyAttendanceRecap> list = recapRepository.findByPeriodYearAndPeriodMonth(year, month);
        if (list.isEmpty()) {
            return generateMonthlyRecap(year, month);
        }
        return list.stream().map(MonthlyAttendanceRecapResponse::fromEntity).collect(Collectors.toList());
    }
}
