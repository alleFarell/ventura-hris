package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.Division;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DivisionRepository extends JpaRepository<Division, UUID> {

    Optional<Division> findByIdAndDeletedFalse(UUID id);

    boolean existsByDepartment_IdAndCodeIgnoreCaseAndDeletedFalse(UUID departmentId, String code);

    boolean existsByDepartment_IdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(UUID departmentId, String code, UUID id);

    boolean existsByDepartment_IdAndDeletedFalse(UUID departmentId);

    @Query("""
            select div from Division div
            join div.company c
            join div.department d
            where div.deleted = false
              and d.deleted = false
              and c.deleted = false
              and (:companyId is null or c.id = :companyId)
              and (:departmentId is null or d.id = :departmentId)
              and (:status is null or div.status = :status)
              and (cast(:search as string) is null
                   or lower(div.code) like concat('%', lower(cast(:search as string)), '%')
                   or lower(div.name) like concat('%', lower(cast(:search as string)), '%'))
            """)
    Page<Division> search(
            @Param("search") String search,
            @Param("companyId") UUID companyId,
            @Param("departmentId") UUID departmentId,
            @Param("status") String status,
            Pageable pageable
    );

    List<Division> findByDepartment_IdAndDeletedFalse(UUID departmentId);

    List<Division> findByCompany_IdAndDeletedFalse(UUID companyId);
}
