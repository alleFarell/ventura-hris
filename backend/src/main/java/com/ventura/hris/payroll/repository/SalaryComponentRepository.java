package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.SalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, UUID> {
    Optional<SalaryComponent> findByCodeIgnoreCase(String code);
    List<SalaryComponent> findByIsActiveTrue();
    boolean existsByCodeIgnoreCase(String code);
}
