package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByIdAndDeletedFalse(UUID id);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(UUID companyId, String code);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String code, UUID id);

    @Query("""
            select d from Department d
            join d.company c
            where d.deleted = false
              and c.deleted = false
              and (:companyId is null or c.id = :companyId)
              and (:status is null or d.status = :status)
              and (cast(:search as string) is null
                   or lower(d.code) like concat('%', lower(cast(:search as string)), '%')
                   or lower(d.name) like concat('%', lower(cast(:search as string)), '%'))
            """)
    Page<Department> search(
            @Param("search") String search,
            @Param("companyId") UUID companyId,
            @Param("status") String status,
            Pageable pageable
    );

    List<Department> findByCompany_IdAndDeletedFalse(UUID companyId);

    List<Department> findByCompany_IdAndStatusAndDeletedFalse(UUID companyId, String status);
}
