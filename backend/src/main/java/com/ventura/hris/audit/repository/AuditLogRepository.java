package com.ventura.hris.audit.repository;

import com.ventura.hris.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @Query("select a from AuditLog a where " +
           "(cast(:entityType as string) is null or lower(a.entityType) = lower(cast(:entityType as string))) and " +
           "(cast(:action as string) is null or lower(a.action) = lower(cast(:action as string))) and " +
           "(cast(:actorUsername as string) is null or lower(a.actorUsername) like concat('%', lower(cast(:actorUsername as string)), '%')) " +
           "order by a.createdAt desc")
    Page<AuditLog> search(
            @Param("entityType") String entityType,
            @Param("action") String action,
            @Param("actorUsername") String actorUsername,
            Pageable pageable
    );

    List<AuditLog> findTop50ByOrderByCreatedAtDesc();

    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
}
