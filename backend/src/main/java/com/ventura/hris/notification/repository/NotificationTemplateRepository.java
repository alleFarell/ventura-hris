package com.ventura.hris.notification.repository;

import com.ventura.hris.notification.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    Optional<NotificationTemplate> findByTemplateCodeIgnoreCase(String templateCode);

    boolean existsByTemplateCodeIgnoreCase(String templateCode);

    List<NotificationTemplate> findAllByOrderByTemplateCodeAsc();
}
