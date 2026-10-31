package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.PtkpConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PtkpConfigurationRepository extends JpaRepository<PtkpConfiguration, UUID> {
    Optional<PtkpConfiguration> findByTaxStatusIgnoreCase(String taxStatus);
}
