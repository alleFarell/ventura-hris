package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, UUID> {

    Optional<BiometricDevice> findByCodeIgnoreCase(String code);

    List<BiometricDevice> findAllByOrderByCodeAsc();
}
