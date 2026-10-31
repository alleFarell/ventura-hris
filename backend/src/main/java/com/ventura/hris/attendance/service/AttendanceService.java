package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.AttendanceRecordResponse;
import com.ventura.hris.attendance.dto.BiometricPunchImportRequest;
import com.ventura.hris.attendance.dto.ClockInRequest;
import com.ventura.hris.attendance.dto.ClockOutRequest;
import com.ventura.hris.attendance.entity.AttendancePunchLog;
import com.ventura.hris.attendance.entity.AttendanceRecord;
import com.ventura.hris.attendance.entity.BiometricDevice;
import com.ventura.hris.attendance.entity.Shift;
import com.ventura.hris.attendance.repository.AttendancePunchLogRepository;
import com.ventura.hris.attendance.repository.AttendanceRecordRepository;
import com.ventura.hris.attendance.repository.BiometricDeviceRepository;
import com.ventura.hris.attendance.repository.RosterAssignmentRepository;
import com.ventura.hris.attendance.repository.ShiftRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRecordRepository recordRepository;
    private final AttendancePunchLogRepository punchLogRepository;
    private final BiometricDeviceRepository deviceRepository;
    private final RosterAssignmentRepository rosterRepository;
    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRecordRepository recordRepository,
            AttendancePunchLogRepository punchLogRepository,
            BiometricDeviceRepository deviceRepository,
            RosterAssignmentRepository rosterRepository,
            ShiftRepository shiftRepository,
            EmployeeRepository employeeRepository) {
        this.recordRepository = recordRepository;
        this.punchLogRepository = punchLogRepository;
        this.deviceRepository = deviceRepository;
        this.rosterRepository = rosterRepository;
        this.shiftRepository = shiftRepository;
        this.employeeRepository = employeeRepository;
    }

    public AttendanceRecordResponse clockIn(ClockInRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee"));

        ZoneId zoneId = ZoneId.of("Asia/Jakarta");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        LocalDate today = now.toLocalDate();
        LocalTime clockInTime = now.toLocalTime();

        // Check if already clocked in today
        Optional<AttendanceRecord> existingRecord = recordRepository.findByEmployeeIdAndRecordDate(employee.getId(), today);
        if (existingRecord.isPresent() && existingRecord.get().getClockInTime() != null) {
            throw new DomainException("ALREADY_CLOCKED_IN", "Employee has already clocked in for today", HttpStatus.BAD_REQUEST);
        }

        // Resolve Shift from Roster or fallback to active shift
        Shift shift = rosterRepository.findByEmployeeIdAndShiftDate(employee.getId(), today)
                .map(ra -> ra.getShift())
                .orElseGet(() -> shiftRepository.findAllByOrderByCodeAsc().stream().findFirst().orElse(null));

        // Create punch log
        AttendancePunchLog punchLog = new AttendancePunchLog();
        punchLog.setEmployee(employee);
        punchLog.setPunchTime(now.toInstant());
        punchLog.setPunchType("CLOCK_IN");
        punchLog.setSource("WEB");
        punchLog.setLatitude(request.latitude());
        punchLog.setLongitude(request.longitude());
        punchLog.setIpAddress(request.ipAddress());
        punchLog.setDeviceInfo(request.deviceInfo());
        punchLog.setIsGeofenceCompliant(true);
        punchLogRepository.save(punchLog);

        // Calculate tardiness
        int lateMinutes = 0;
        String status = "PRESENT";
        if (shift != null) {
            LocalTime allowableTime = shift.getStartTime().plusMinutes(shift.getGracePeriodMinutes());
            if (clockInTime.isAfter(allowableTime)) {
                lateMinutes = (int) ChronoUnit.MINUTES.between(shift.getStartTime(), clockInTime);
                status = "LATE";
            }
        }

        AttendanceRecord record = existingRecord.orElseGet(() -> {
            AttendanceRecord ar = new AttendanceRecord();
            ar.setEmployee(employee);
            ar.setRecordDate(today);
            return ar;
        });

        record.setShift(shift);
        record.setClockInTime(now.toInstant());
        record.setLateMinutes(lateMinutes);
        record.setStatus(status);
        if (request.notes() != null) {
            record.setNotes(request.notes());
        }

        return AttendanceRecordResponse.from(recordRepository.save(record));
    }

    public AttendanceRecordResponse clockOut(ClockOutRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee"));

        ZoneId zoneId = ZoneId.of("Asia/Jakarta");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        LocalDate today = now.toLocalDate();
        LocalTime clockOutTime = now.toLocalTime();

        AttendanceRecord record = recordRepository.findByEmployeeIdAndRecordDate(employee.getId(), today)
                .orElseThrow(() -> new DomainException("NO_CLOCK_IN", "Employee has not clocked in today", HttpStatus.BAD_REQUEST));

        if (record.getClockOutTime() != null) {
            throw new DomainException("ALREADY_CLOCKED_OUT", "Employee has already clocked out for today", HttpStatus.BAD_REQUEST);
        }

        // Create punch log
        AttendancePunchLog punchLog = new AttendancePunchLog();
        punchLog.setEmployee(employee);
        punchLog.setPunchTime(now.toInstant());
        punchLog.setPunchType("CLOCK_OUT");
        punchLog.setSource("WEB");
        punchLog.setLatitude(request.latitude());
        punchLog.setLongitude(request.longitude());
        punchLog.setIpAddress(request.ipAddress());
        punchLog.setDeviceInfo(request.deviceInfo());
        punchLog.setIsGeofenceCompliant(true);
        punchLogRepository.save(punchLog);

        record.setClockOutTime(now.toInstant());

        // Working hours calculation
        Duration duration = Duration.between(record.getClockInTime(), record.getClockOutTime());
        long totalMinutes = duration.toMinutes();
        int breakMins = record.getShift() != null ? record.getShift().getBreakMinutes() : 60;
        long netMinutes = Math.max(0, totalMinutes - breakMins);
        BigDecimal hours = BigDecimal.valueOf(netMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        record.setWorkingHours(hours);

        // Early departure check
        if (record.getShift() != null && clockOutTime.isBefore(record.getShift().getEndTime())) {
            int earlyDeparture = (int) ChronoUnit.MINUTES.between(clockOutTime, record.getShift().getEndTime());
            record.setEarlyDepartureMinutes(earlyDeparture);
            if ("PRESENT".equals(record.getStatus())) {
                record.setStatus("EARLY_LEAVE");
            }
        }

        if (request.notes() != null) {
            record.setNotes(request.notes());
        }

        return AttendanceRecordResponse.from(recordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public Optional<AttendanceRecordResponse> getMyTodayRecord(UUID employeeId) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Jakarta"));
        return recordRepository.findByEmployeeIdAndRecordDate(employeeId, today)
                .map(AttendanceRecordResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceRecordResponse> listRecords(LocalDate startDate, LocalDate endDate, UUID employeeId, Pageable pageable) {
        if (employeeId != null) {
            return recordRepository.findByEmployeeIdAndRecordDateBetween(employeeId, startDate, endDate, pageable)
                    .map(AttendanceRecordResponse::from);
        }
        return recordRepository.findByRecordDateBetween(startDate, endDate, pageable)
                .map(AttendanceRecordResponse::from);
    }

    public int importBiometricPunches(BiometricPunchImportRequest request) {
        BiometricDevice device = deviceRepository.findByCodeIgnoreCase(request.deviceCode())
                .orElseThrow(() -> new ResourceNotFoundException("BiometricDevice: " + request.deviceCode()));

        int importedCount = 0;
        ZoneId zoneId = ZoneId.of("Asia/Jakarta");

        for (BiometricPunchImportRequest.BiometricPunchItem punch : request.punches()) {
            Optional<Employee> empOpt = employeeRepository.findByEmployeeNumberIgnoreCase(punch.employeeNumber());
            if (empOpt.isEmpty()) continue;
            Employee emp = empOpt.get();

            AttendancePunchLog log = new AttendancePunchLog();
            log.setEmployee(emp);
            log.setPunchTime(punch.punchTime());
            log.setPunchType(punch.punchType());
            log.setSource("BIOMETRIC");
            log.setDeviceInfo(device.getName());
            punchLogRepository.save(log);

            LocalDate punchDate = punch.punchTime().atZone(zoneId).toLocalDate();
            AttendanceRecord record = recordRepository.findByEmployeeIdAndRecordDate(emp.getId(), punchDate)
                    .orElseGet(() -> {
                        AttendanceRecord ar = new AttendanceRecord();
                        ar.setEmployee(emp);
                        ar.setRecordDate(punchDate);
                        return ar;
                    });

            if ("CLOCK_IN".equalsIgnoreCase(punch.punchType())) {
                if (record.getClockInTime() == null || punch.punchTime().isBefore(record.getClockInTime())) {
                    record.setClockInTime(punch.punchTime());
                }
            } else if ("CLOCK_OUT".equalsIgnoreCase(punch.punchType())) {
                if (record.getClockOutTime() == null || punch.punchTime().isAfter(record.getClockOutTime())) {
                    record.setClockOutTime(punch.punchTime());
                }
            }

            // Recalculate working hours if both in and out exist
            if (record.getClockInTime() != null && record.getClockOutTime() != null) {
                long mins = Math.max(0, Duration.between(record.getClockInTime(), record.getClockOutTime()).toMinutes() - 60);
                record.setWorkingHours(BigDecimal.valueOf(mins).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP));
            }

            recordRepository.save(record);
            importedCount++;
        }

        device.setLastSyncAt(Instant.now());
        deviceRepository.save(device);

        return importedCount;
    }
}
