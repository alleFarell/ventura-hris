package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.Grade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GradeRepository extends JpaRepository<Grade, UUID> {

    Optional<Grade> findByIdAndDeletedFalse(UUID id);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(UUID companyId, String code);

    boolean existsByCompany_IdAndSortOrderAndDeletedFalse(UUID companyId, Integer sortOrder);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String code, UUID id);

    boolean existsByCompany_IdAndSortOrderAndIdNotAndDeletedFalse(UUID companyId, Integer sortOrder, UUID id);

    List<Grade> findByCompany_IdAndDeletedFalseOrderBySortOrderAsc(UUID companyId);

    Page<Grade> findByCompany_IdAndDeletedFalse(UUID companyId, Pageable pageable);
}
