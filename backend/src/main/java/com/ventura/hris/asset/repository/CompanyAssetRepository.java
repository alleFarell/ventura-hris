package com.ventura.hris.asset.repository;

import com.ventura.hris.asset.entity.CompanyAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyAssetRepository extends JpaRepository<CompanyAsset, UUID> {
    List<CompanyAsset> findByCompanyId(UUID companyId);
    List<CompanyAsset> findByCompanyIdAndCategoryId(UUID companyId, UUID categoryId);
    List<CompanyAsset> findByCompanyIdAndStatus(UUID companyId, String status);
    Optional<CompanyAsset> findByCompanyIdAndAssetTag(UUID companyId, String assetTag);
}
