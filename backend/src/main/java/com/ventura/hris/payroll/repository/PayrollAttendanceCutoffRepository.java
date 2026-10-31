package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.PayrollAttendanceCutoff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollAttendanceCutoffRepository extends JpaRepository<PayrollAttendanceCutoff, UUID> {
    List<PayrollAttendanceCutoff> findByPeriodId(UUID periodId);
    Optional<PayrollAttendanceCutoff> findByPeriodIdAndEmployeeId(UUID periodId, UUID employeeId);
    void deleteByPeriodId(UUID periodId);
}
