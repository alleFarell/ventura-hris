package com.ventura.hris.security.repository;

import com.ventura.hris.security.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByCodeIgnoreCase(String code);

    List<Permission> findByCategoryIgnoreCaseOrderByCodeAsc(String category);

    List<Permission> findAllByOrderByCategoryAscCodeAsc();
}
