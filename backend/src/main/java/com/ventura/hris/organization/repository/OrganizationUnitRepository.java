package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.OrganizationUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationUnitRepository extends JpaRepository<OrganizationUnit, UUID> {

    Optional<OrganizationUnit> findByIdAndDeletedFalse(UUID id);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(UUID companyId, String code);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String code, UUID id);

    Optional<OrganizationUnit> findByDepartment_IdAndDeletedFalse(UUID departmentId);

    Optional<OrganizationUnit> findByPosition_IdAndDeletedFalse(UUID positionId);

    Optional<OrganizationUnit> findByDivision_IdAndDeletedFalse(UUID divisionId);

    List<OrganizationUnit> findByCompany_IdAndParentUnitIsNullAndDeletedFalse(UUID companyId);

    List<OrganizationUnit> findByParentUnit_IdAndDeletedFalse(UUID parentUnitId);

    List<OrganizationUnit> findByCompany_IdAndDeletedFalse(UUID companyId);

    boolean existsByParentUnit_IdAndDeletedFalse(UUID parentUnitId);

    @Query("""
            select u from OrganizationUnit u
            where u.company.id = :companyId
              and u.deleted = false
            order by u.name asc
            """)
    List<OrganizationUnit> findAllActiveByCompanyId(@Param("companyId") UUID companyId);
}
