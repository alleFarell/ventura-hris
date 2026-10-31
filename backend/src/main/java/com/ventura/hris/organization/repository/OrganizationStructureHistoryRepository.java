package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.OrganizationStructureHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrganizationStructureHistoryRepository extends JpaRepository<OrganizationStructureHistory, UUID> {

    @Query("""
            select h from OrganizationStructureHistory h
            left join fetch h.organizationUnit u
            left join fetch h.oldParentUnit op
            left join fetch h.newParentUnit np
            where h.organizationUnit.id = :unitId
              and h.deleted = false
            order by h.effectiveDate desc, h.createdAt desc
            """)
    List<OrganizationStructureHistory> findHistoryByUnitId(@Param("unitId") UUID unitId);
}
