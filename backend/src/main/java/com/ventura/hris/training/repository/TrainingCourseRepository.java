package com.ventura.hris.training.repository;

import com.ventura.hris.training.entity.TrainingCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainingCourseRepository extends JpaRepository<TrainingCourse, UUID> {
    List<TrainingCourse> findByCompanyId(UUID companyId);
    Optional<TrainingCourse> findByCompanyIdAndCode(UUID companyId, String code);
}
