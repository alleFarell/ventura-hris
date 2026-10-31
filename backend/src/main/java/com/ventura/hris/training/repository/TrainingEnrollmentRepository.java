package com.ventura.hris.training.repository;

import com.ventura.hris.training.entity.TrainingEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, UUID> {
    List<TrainingEnrollment> findBySessionId(UUID sessionId);
    List<TrainingEnrollment> findByEmployeeId(UUID employeeId);
    Optional<TrainingEnrollment> findBySessionIdAndEmployeeId(UUID sessionId, UUID employeeId);
    long countBySessionIdAndStatusIn(UUID sessionId, List<String> statuses);
}
