package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.PayrollSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollSimulationRepository extends JpaRepository<PayrollSimulation, UUID> {
    List<PayrollSimulation> findByPeriodId(UUID periodId);
    Optional<PayrollSimulation> findByPeriodIdAndEmployeeId(UUID periodId, UUID employeeId);
    void deleteByPeriodId(UUID periodId);
}
