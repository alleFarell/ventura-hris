package com.ventura.hris.leave.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.leave.dto.LeaveTypeRequest;
import com.ventura.hris.leave.dto.LeaveTypeResponse;
import com.ventura.hris.leave.entity.LeaveType;
import com.ventura.hris.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeService(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream()
                .map(LeaveTypeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public LeaveTypeResponse getLeaveTypeById(UUID id) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));
        return LeaveTypeResponse.fromEntity(type);
    }

    public LeaveTypeResponse createLeaveType(LeaveTypeRequest req) {
        if (leaveTypeRepository.findByCodeIgnoreCase(req.getCode()).isPresent()) {
            throw new DomainException("DUPLICATE_LEAVE_TYPE", "Leave type with code " + req.getCode() + " already exists");
        }

        LeaveType type = new LeaveType();
        type.setCode(req.getCode().trim().toUpperCase());
        type.setName(req.getName().trim());
        type.setDescription(req.getDescription());
        type.setDefaultQuota(req.getDefaultQuota() != null ? req.getDefaultQuota() : 0);
        type.setIsPaid(req.getIsPaid() != null ? req.getIsPaid() : true);
        type.setRequiresAttachment(req.getRequiresAttachment() != null ? req.getRequiresAttachment() : false);
        type.setMaxConsecutiveDays(req.getMaxConsecutiveDays() != null ? req.getMaxConsecutiveDays() : 30);
        type.setCarryForwardAllowed(req.getCarryForwardAllowed() != null ? req.getCarryForwardAllowed() : false);
        type.setMaxCarryForward(req.getMaxCarryForward() != null ? req.getMaxCarryForward() : 0);
        type.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);

        return LeaveTypeResponse.fromEntity(leaveTypeRepository.save(type));
    }

    public LeaveTypeResponse updateLeaveType(UUID id, LeaveTypeRequest req) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));

        leaveTypeRepository.findByCodeIgnoreCase(req.getCode()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new DomainException("DUPLICATE_LEAVE_TYPE", "Leave type code " + req.getCode() + " is already taken");
            }
        });

        type.setCode(req.getCode().trim().toUpperCase());
        type.setName(req.getName().trim());
        type.setDescription(req.getDescription());
        type.setDefaultQuota(req.getDefaultQuota() != null ? req.getDefaultQuota() : 0);
        type.setIsPaid(req.getIsPaid() != null ? req.getIsPaid() : true);
        type.setRequiresAttachment(req.getRequiresAttachment() != null ? req.getRequiresAttachment() : false);
        type.setMaxConsecutiveDays(req.getMaxConsecutiveDays() != null ? req.getMaxConsecutiveDays() : 30);
        type.setCarryForwardAllowed(req.getCarryForwardAllowed() != null ? req.getCarryForwardAllowed() : false);
        type.setMaxCarryForward(req.getMaxCarryForward() != null ? req.getMaxCarryForward() : 0);
        type.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);

        return LeaveTypeResponse.fromEntity(leaveTypeRepository.save(type));
    }

    public void deleteLeaveType(UUID id) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));
        leaveTypeRepository.delete(type);
    }
}
