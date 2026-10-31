package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.OvertimeRequestCreateRequest;
import com.ventura.hris.attendance.dto.OvertimeRequestResponse;
import com.ventura.hris.attendance.entity.OvertimeRequest;
import com.ventura.hris.attendance.repository.CompanyHolidayRepository;
import com.ventura.hris.attendance.repository.OvertimeRequestRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OvertimeService {

    private final OvertimeRequestRepository overtimeRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyHolidayRepository holidayRepository;

    public OvertimeService(
            OvertimeRequestRepository overtimeRepository,
            EmployeeRepository employeeRepository,
            CompanyHolidayRepository holidayRepository
    ) {
        this.overtimeRepository = overtimeRepository;
        this.employeeRepository = employeeRepository;
        this.holidayRepository = holidayRepository;
    }

    public BigDecimal calculateMultiplierHours(LocalDate date, BigDecimal rawHours, UUID companyId) {
        boolean isWeekend = (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY);
        boolean isHoliday = holidayRepository.existsByHolidayDateAndCompanyId(date, companyId);

        boolean isRestDay = isWeekend || isHoliday;
        double raw = rawHours.doubleValue();
        double multiplier;

        if (isRestDay) {
            if (raw <= 7.0) {
                multiplier = raw * 2.0;
            } else {
                multiplier = (7.0 * 2.0) + ((raw - 7.0) * 3.0);
            }
        } else {
            if (raw <= 1.0) {
                multiplier = raw * 1.5;
            } else {
                multiplier = (1.0 * 1.5) + ((raw - 1.0) * 2.0);
            }
        }

        return BigDecimal.valueOf(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    public OvertimeRequestResponse createOvertimeRequest(OvertimeRequestCreateRequest req) {
        if (req.getEmployeeId() == null) {
            throw new DomainException("REQUIRED_FIELD", "Employee ID is required");
        }

        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", req.getEmployeeId()));

        if (req.getEndTime().isBefore(req.getStartTime())) {
            throw new DomainException("INVALID_TIME_RANGE", "Overtime end time cannot be before start time");
        }

        long minutes = Duration.between(req.getStartTime(), req.getEndTime()).toMinutes();
        if (minutes < 30) {
            throw new DomainException("MINIMUM_OVERTIME", "Overtime duration must be at least 30 minutes");
        }

        BigDecimal rawHours = BigDecimal.valueOf(minutes / 60.0).setScale(2, RoundingMode.HALF_UP);
        UUID companyId = employee.getCompany() != null ? employee.getCompany().getId() : null;
        BigDecimal multiplierHours = calculateMultiplierHours(req.getOvertimeDate(), rawHours, companyId);

        OvertimeRequest ot = new OvertimeRequest();
        ot.setEmployee(employee);
        ot.setOvertimeDate(req.getOvertimeDate());
        ot.setStartTime(req.getStartTime());
        ot.setEndTime(req.getEndTime());
        ot.setRawHours(rawHours);
        ot.setMultiplierHours(multiplierHours);
        ot.setReason(req.getReason().trim());
        ot.setStatus("SUBMITTED");
        ot.setCompensationType(req.getCompensationType() != null ? req.getCompensationType() : "PAID");

        if (req.getApproverId() != null) {
            employeeRepository.findById(req.getApproverId()).ifPresent(ot::setApprover);
        } else {
            List<Employee> others = employeeRepository.findAll().stream()
                    .filter(e -> !e.getId().equals(employee.getId()))
                    .collect(Collectors.toList());
            if (!others.isEmpty()) {
                ot.setApprover(others.get(0));
            }
        }

        return OvertimeRequestResponse.fromEntity(overtimeRepository.save(ot));
    }

    public OvertimeRequestResponse approveOvertime(UUID id, String comments) {
        OvertimeRequest request = overtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OvertimeRequest", id));

        if (!"SUBMITTED".equalsIgnoreCase(request.getStatus())) {
            throw new DomainException("INVALID_STATE", "Overtime request is already " + request.getStatus());
        }

        request.setStatus("APPROVED");
        request.setManagerComment(comments);
        request.setActionedAt(Instant.now());
        return OvertimeRequestResponse.fromEntity(overtimeRepository.save(request));
    }

    public OvertimeRequestResponse rejectOvertime(UUID id, String comments) {
        OvertimeRequest request = overtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OvertimeRequest", id));

        if (!"SUBMITTED".equalsIgnoreCase(request.getStatus())) {
            throw new DomainException("INVALID_STATE", "Overtime request is already " + request.getStatus());
        }

        request.setStatus("REJECTED");
        request.setManagerComment(comments);
        request.setActionedAt(Instant.now());
        return OvertimeRequestResponse.fromEntity(overtimeRepository.save(request));
    }

    public List<OvertimeRequestResponse> getEmployeeOvertime(UUID employeeId) {
        return overtimeRepository.findByEmployeeIdOrderByOvertimeDateDesc(employeeId).stream()
                .map(OvertimeRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<OvertimeRequestResponse> getApproverInbox(UUID approverId, String status) {
        String queryStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "SUBMITTED";
        return overtimeRepository.findByApproverIdAndStatusOrderByCreatedAtDesc(approverId, queryStatus).stream()
                .map(OvertimeRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<OvertimeRequestResponse> getAllRequests(String status) {
        if (status != null && !status.isBlank()) {
            return overtimeRepository.findByStatusOrderByOvertimeDateDesc(status.toUpperCase()).stream()
                    .map(OvertimeRequestResponse::fromEntity)
                    .collect(Collectors.toList());
        }
        return overtimeRepository.findAll().stream()
                .sorted((a, b) -> b.getOvertimeDate().compareTo(a.getOvertimeDate()))
                .map(OvertimeRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
