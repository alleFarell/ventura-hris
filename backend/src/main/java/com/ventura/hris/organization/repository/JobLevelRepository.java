package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.JobLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobLevelRepository extends JpaRepository<JobLevel, UUID> {

    Optional<JobLevel> findByIdAndDeletedFalse(UUID id);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(UUID companyId, String code);

    boolean existsByCompany_IdAndSortOrderAndDeletedFalse(UUID companyId, Integer sortOrder);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String code, UUID id);

    boolean existsByCompany_IdAndSortOrderAndIdNotAndDeletedFalse(UUID companyId, Integer sortOrder, UUID id);

    List<JobLevel> findByCompany_IdAndDeletedFalseOrderBySortOrderAsc(UUID companyId);

    Page<JobLevel> findByCompany_IdAndDeletedFalse(UUID companyId, Pageable pageable);
}
