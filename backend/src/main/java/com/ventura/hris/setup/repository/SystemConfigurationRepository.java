package com.ventura.hris.setup.repository;

import com.ventura.hris.setup.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, UUID> {
}
