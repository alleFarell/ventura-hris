package com.ventura.hris.recruitment.repository;

import com.ventura.hris.recruitment.entity.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, UUID> {
    List<InterviewSchedule> findByApplicationId(UUID applicationId);
    List<InterviewSchedule> findByInterviewerId(UUID interviewerId);
    List<InterviewSchedule> findByStatus(String status);
}
