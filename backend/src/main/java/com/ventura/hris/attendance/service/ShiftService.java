package com.ventura.hris.attendance.service;

import com.ventura.hris.attendance.dto.ShiftPatternRequest;
import com.ventura.hris.attendance.dto.ShiftPatternResponse;
import com.ventura.hris.attendance.dto.ShiftRequest;
import com.ventura.hris.attendance.dto.ShiftResponse;
import com.ventura.hris.attendance.entity.Shift;
import com.ventura.hris.attendance.entity.ShiftPattern;
import com.ventura.hris.attendance.repository.ShiftPatternRepository;
import com.ventura.hris.attendance.repository.ShiftRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final ShiftPatternRepository shiftPatternRepository;

    public ShiftService(ShiftRepository shiftRepository, ShiftPatternRepository shiftPatternRepository) {
        this.shiftRepository = shiftRepository;
        this.shiftPatternRepository = shiftPatternRepository;
    }

    @Transactional(readOnly = true)
    public List<ShiftResponse> listShifts() {
        return shiftRepository.findAllByOrderByCodeAsc().stream()
                .map(ShiftResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShiftResponse getShift(UUID id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift"));
        return ShiftResponse.from(shift);
    }

    public ShiftResponse createShift(ShiftRequest request) {
        if (shiftRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DomainException("SHIFT_CODE_EXISTS", "Shift code already exists: " + request.code(), HttpStatus.CONFLICT);
        }
        Shift shift = new Shift();
        shift.setCode(request.code().toUpperCase());
        shift.setName(request.name());
        shift.setDescription(request.description());
        shift.setStartTime(request.startTime());
        shift.setEndTime(request.endTime());
        shift.setBreakMinutes(request.breakMinutes() != null ? request.breakMinutes() : 60);
        shift.setGracePeriodMinutes(request.gracePeriodMinutes() != null ? request.gracePeriodMinutes() : 15);
        shift.setIsOvernight(request.isOvernight() != null ? request.isOvernight() : false);
        shift.setIsActive(request.isActive() != null ? request.isActive() : true);

        return ShiftResponse.from(shiftRepository.save(shift));
    }

    public ShiftResponse updateShift(UUID id, ShiftRequest request) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift"));

        if (!shift.getCode().equalsIgnoreCase(request.code()) && shiftRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DomainException("SHIFT_CODE_EXISTS", "Shift code already exists: " + request.code(), HttpStatus.CONFLICT);
        }

        shift.setCode(request.code().toUpperCase());
        shift.setName(request.name());
        shift.setDescription(request.description());
        shift.setStartTime(request.startTime());
        shift.setEndTime(request.endTime());
        if (request.breakMinutes() != null) shift.setBreakMinutes(request.breakMinutes());
        if (request.gracePeriodMinutes() != null) shift.setGracePeriodMinutes(request.gracePeriodMinutes());
        if (request.isOvernight() != null) shift.setIsOvernight(request.isOvernight());
        if (request.isActive() != null) shift.setIsActive(request.isActive());

        return ShiftResponse.from(shiftRepository.save(shift));
    }

    public void deleteShift(UUID id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift"));
        shiftRepository.delete(shift);
    }

    @Transactional(readOnly = true)
    public List<ShiftPatternResponse> listPatterns() {
        return shiftPatternRepository.findAllByOrderByCodeAsc().stream()
                .map(ShiftPatternResponse::from)
                .toList();
    }

    public ShiftPatternResponse createPattern(ShiftPatternRequest request) {
        if (shiftPatternRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DomainException("PATTERN_CODE_EXISTS", "Pattern code already exists: " + request.code(), HttpStatus.CONFLICT);
        }

        ShiftPattern pattern = new ShiftPattern();
        pattern.setCode(request.code().toUpperCase());
        pattern.setName(request.name());
        pattern.setDescription(request.description());
        pattern.setPatternSequence(request.patternSequence());
        pattern.setCycleDays(request.cycleDays() != null ? request.cycleDays() : 7);
        pattern.setIsActive(request.isActive() != null ? request.isActive() : true);

        return ShiftPatternResponse.from(shiftPatternRepository.save(pattern));
    }
}
