package com.ventura.hris.training.repository;

import com.ventura.hris.training.entity.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {
    List<TrainingSession> findByCourseId(UUID courseId);
    List<TrainingSession> findByStatus(String status);
}
