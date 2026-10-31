package com.ventura.hris.performance.repository;

import com.ventura.hris.performance.entity.CompetencyModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompetencyModelRepository extends JpaRepository<CompetencyModel, UUID> {
    List<CompetencyModel> findByCompanyId(UUID companyId);
    Optional<CompetencyModel> findByCompanyIdAndCode(UUID companyId, String code);
}
