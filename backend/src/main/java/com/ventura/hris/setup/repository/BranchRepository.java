package com.ventura.hris.setup.repository;

import com.ventura.hris.setup.entity.Branch;
import com.ventura.hris.setup.entity.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, UUID> {

    Optional<Branch> findByIdAndDeletedFalse(UUID id);

    boolean existsByCompany_IdAndCodeIgnoreCase(UUID companyId, String code);

    boolean existsByCompany_IdAndDeletedFalse(UUID companyId);

    boolean existsByCompany_StatusAndStatusAndDeletedFalse(RecordStatus companyStatus, RecordStatus status);

    @Query("""
            select b from Branch b
            join b.company c
            where b.deleted = false
              and c.deleted = false
              and (:companyId is null or c.id = :companyId)
              and (:status is null or b.status = :status)
              and (cast(:search as string) is null
                   or lower(b.code) like concat('%', lower(cast(:search as string)), '%')
                   or lower(b.name) like concat('%', lower(cast(:search as string)), '%')
                   or lower(c.code) like concat('%', lower(cast(:search as string)), '%'))
            """)
    Page<Branch> search(@Param("search") String search, @Param("companyId") UUID companyId,
                        @Param("status") RecordStatus status, Pageable pageable);
}
