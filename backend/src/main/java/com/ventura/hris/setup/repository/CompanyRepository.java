package com.ventura.hris.setup.repository;

import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.entity.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByIdAndDeletedFalse(UUID id);

    Optional<Company> findByCodeIgnoreCase(String code);

    boolean existsByStatusAndDeletedFalse(RecordStatus status);

    @Query("""
            select c from Company c
            where c.deleted = false
              and (:status is null or c.status = :status)
              and (cast(:search as string) is null
                   or lower(c.code) like concat('%', lower(cast(:search as string)), '%')
                   or lower(c.name) like concat('%', lower(cast(:search as string)), '%')
                   or lower(c.legalName) like concat('%', lower(cast(:search as string)), '%'))
            """)
    Page<Company> search(@Param("search") String search, @Param("status") RecordStatus status, Pageable pageable);
}
