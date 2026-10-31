package com.ventura.hris.recruitment.repository;

import com.ventura.hris.recruitment.entity.JobRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRequisitionRepository extends JpaRepository<JobRequisition, UUID> {
    Optional<JobRequisition> findByRequisitionNumber(String requisitionNumber);
    List<JobRequisition> findByDepartmentId(UUID departmentId);
    List<JobRequisition> findByStatus(String status);
}
