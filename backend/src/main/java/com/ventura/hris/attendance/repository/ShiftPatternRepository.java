package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.ShiftPattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShiftPatternRepository extends JpaRepository<ShiftPattern, UUID> {

    Optional<ShiftPattern> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<ShiftPattern> findAllByOrderByCodeAsc();

    List<ShiftPattern> findByIsActiveTrueOrderByCodeAsc();
}
