package com.ventura.hris.organization.repository;

import com.ventura.hris.organization.entity.Position;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {

    Optional<Position> findByIdAndDeletedFalse(UUID id);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndDeletedFalse(UUID companyId, String code);

    boolean existsByCompany_IdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String code, UUID id);

    boolean existsByDepartment_IdAndDeletedFalse(UUID departmentId);

    boolean existsByDivision_IdAndDeletedFalse(UUID divisionId);

    boolean existsByGrade_IdAndDeletedFalse(UUID gradeId);

    boolean existsByJobLevel_IdAndDeletedFalse(UUID jobLevelId);

    @Query("""
            select p from Position p
            join p.company c
            left join p.department d
            left join p.division div
            left join p.grade g
            left join p.jobLevel jl
            where p.deleted = false
              and c.deleted = false
              and (:companyId is null or c.id = :companyId)
              and (:departmentId is null or d.id = :departmentId)
              and (:divisionId is null or div.id = :divisionId)
              and (:gradeId is null or g.id = :gradeId)
              and (:jobLevelId is null or jl.id = :jobLevelId)
              and (:status is null or p.status = :status)
              and (cast(:search as string) is null
                   or lower(p.code) like concat('%', lower(cast(:search as string)), '%')
                   or lower(p.name) like concat('%', lower(cast(:search as string)), '%'))
            """)
    Page<Position> search(
            @Param("search") String search,
            @Param("companyId") UUID companyId,
            @Param("departmentId") UUID departmentId,
            @Param("divisionId") UUID divisionId,
            @Param("gradeId") UUID gradeId,
            @Param("jobLevelId") UUID jobLevelId,
            @Param("status") String status,
            Pageable pageable
    );

    List<Position> findByCompany_IdAndDeletedFalse(UUID companyId);
}
