package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.AssignRosterRequest;
import com.ventura.hris.attendance.dto.BulkPatternRosterRequest;
import com.ventura.hris.attendance.dto.RosterAssignmentResponse;
import com.ventura.hris.attendance.entity.RosterAssignment;
import com.ventura.hris.attendance.entity.Shift;
import com.ventura.hris.attendance.entity.ShiftPattern;
import com.ventura.hris.attendance.repository.RosterAssignmentRepository;
import com.ventura.hris.attendance.repository.ShiftPatternRepository;
import com.ventura.hris.attendance.repository.ShiftRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class RosterService {

    private final RosterAssignmentRepository rosterRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftPatternRepository patternRepository;

    public RosterService(
            RosterAssignmentRepository rosterRepository,
            EmployeeRepository employeeRepository,
            ShiftRepository shiftRepository,
            ShiftPatternRepository patternRepository) {
        this.rosterRepository = rosterRepository;
        this.employeeRepository = employeeRepository;
        this.shiftRepository = shiftRepository;
        this.patternRepository = patternRepository;
    }

    @Transactional(readOnly = true)
    public List<RosterAssignmentResponse> getRosterBetweenDates(LocalDate startDate, LocalDate endDate) {
        return rosterRepository.findRosterBetweenDates(startDate, endDate)
                .stream()
                .map(RosterAssignmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RosterAssignmentResponse> getEmployeeRoster(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        return rosterRepository.findByEmployeeIdAndShiftDateBetweenOrderByShiftDateAsc(employeeId, startDate, endDate)
                .stream()
                .map(RosterAssignmentResponse::from)
                .toList();
    }

    public RosterAssignmentResponse assignRoster(AssignRosterRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee"));

        Shift shift = null;
        boolean isDayOff = Boolean.TRUE.equals(request.isDayOff());

        if (!isDayOff) {
            if (request.shiftId() == null) {
                throw new DomainException("SHIFT_REQUIRED", "Shift is required when day off is false", HttpStatus.BAD_REQUEST);
            }
            shift = shiftRepository.findById(request.shiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift"));
        }

        RosterAssignment assignment = rosterRepository.findByEmployeeIdAndShiftDate(request.employeeId(), request.shiftDate())
                .orElseGet(() -> {
                    RosterAssignment ra = new RosterAssignment();
                    ra.setEmployee(employee);
                    ra.setShiftDate(request.shiftDate());
                    return ra;
                });

        assignment.setShift(shift);
        assignment.setIsDayOff(isDayOff);
        assignment.setOverrideReason(request.overrideReason());

        return RosterAssignmentResponse.from(rosterRepository.save(assignment));
    }

    public int bulkPatternAssign(BulkPatternRosterRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new DomainException("INVALID_DATE_RANGE", "End date cannot be before start date", HttpStatus.BAD_REQUEST);
        }

        ShiftPattern pattern = patternRepository.findById(request.patternId())
                .orElseThrow(() -> new ResourceNotFoundException("ShiftPattern"));

        String[] sequence = Arrays.stream(pattern.getPatternSequence().split(","))
                .map(String::trim)
                .toArray(String[]::new);

        if (sequence.length == 0) {
            throw new DomainException("INVALID_PATTERN", "Pattern sequence is empty", HttpStatus.BAD_REQUEST);
        }

        int cycleDays = pattern.getCycleDays() > 0 ? pattern.getCycleDays() : sequence.length;

        // Cache shifts by code
        Map<String, Shift> shiftCache = new HashMap<>();
        for (String code : sequence) {
            if (!"OFF".equalsIgnoreCase(code) && !shiftCache.containsKey(code.toUpperCase())) {
                shiftRepository.findByCodeIgnoreCase(code)
                        .ifPresent(s -> shiftCache.put(code.toUpperCase(), s));
            }
        }

        int totalAssigned = 0;
        long days = ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;

        for (UUID employeeId : request.employeeIds()) {
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) continue;

            for (int i = 0; i < days; i++) {
                LocalDate currentDate = request.startDate().plusDays(i);
                int dayIndex = i % cycleDays;
                String shiftCode = dayIndex < sequence.length ? sequence[dayIndex] : "OFF";

                RosterAssignment assignment = rosterRepository.findByEmployeeIdAndShiftDate(employeeId, currentDate)
                        .orElseGet(() -> {
                            RosterAssignment ra = new RosterAssignment();
                            ra.setEmployee(employee);
                            ra.setShiftDate(currentDate);
                            return ra;
                        });

                if ("OFF".equalsIgnoreCase(shiftCode)) {
                    assignment.setIsDayOff(true);
                    assignment.setShift(null);
                } else {
                    assignment.setIsDayOff(false);
                    assignment.setShift(shiftCache.get(shiftCode.toUpperCase()));
                }
                assignment.setOverrideReason("Pattern: " + pattern.getCode());
                rosterRepository.save(assignment);
                totalAssigned++;
            }
        }

        return totalAssigned;
    }

    public void deleteRoster(UUID id) {
        RosterAssignment assignment = rosterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RosterAssignment"));
        rosterRepository.delete(assignment);
    }
}
