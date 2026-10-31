package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, UUID> {
    Optional<SalaryStructure> findByGradeId(UUID gradeId);
    List<SalaryStructure> findByIsActiveTrue();
    boolean existsByGradeId(UUID gradeId);
}
