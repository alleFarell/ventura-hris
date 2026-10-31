package com.ventura.hris.audit.service;

import com.ventura.hris.audit.dto.AuditLogResponse;
import com.ventura.hris.audit.entity.AuditLog;
import com.ventura.hris.audit.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog log(UUID userId, String actorUsername, String action, String entityType, String entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog(
                userId,
                actorUsername != null ? actorUsername : "SYSTEM",
                action,
                entityType,
                entityId,
                details,
                ipAddress
        );
        return auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> searchAuditLogs(String entityType, String action, String actorUsername, Pageable pageable) {
        String entityFilter = (entityType != null && !entityType.isBlank()) ? entityType.trim() : null;
        String actionFilter = (action != null && !action.isBlank()) ? action.trim() : null;
        String actorFilter = (actorUsername != null && !actorUsername.isBlank()) ? actorUsername.trim() : null;

        return auditLogRepository.search(entityFilter, actionFilter, actorFilter, pageable)
                .map(AuditLogResponse::fromEntity);
    }
}
