package com.ventura.hris.leave.repository;

import com.ventura.hris.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID> {
    Optional<LeaveType> findByCodeIgnoreCase(String code);
    List<LeaveType> findByIsActiveTrueOrderByCodeAsc();
}
