package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeSalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeSalaryComponentRepository extends JpaRepository<EmployeeSalaryComponent, UUID> {
    List<EmployeeSalaryComponent> findByProfileId(UUID profileId);
    void deleteByProfileId(UUID profileId);
}
