package com.ventura.hris.asset.repository;

import com.ventura.hris.asset.entity.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, UUID> {
    List<AssetAllocation> findByAssetId(UUID assetId);
    List<AssetAllocation> findByEmployeeId(UUID employeeId);
    List<AssetAllocation> findByAssetIdAndStatus(UUID assetId, String status);
    List<AssetAllocation> findByEmployeeIdAndStatus(UUID employeeId, String status);
}
