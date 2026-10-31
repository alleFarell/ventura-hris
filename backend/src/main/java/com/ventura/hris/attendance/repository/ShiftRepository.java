package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    Optional<Shift> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Shift> findAllByOrderByCodeAsc();

    List<Shift> findByIsActiveTrueOrderByCodeAsc();
}
