package com.ventura.hris.asset.repository;

import com.ventura.hris.asset.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, UUID> {
    List<AssetCategory> findByCompanyId(UUID companyId);
    Optional<AssetCategory> findByCompanyIdAndCode(UUID companyId, String code);
}
