package com.ventura.hris.employee.repository;

import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByIdAndDeletedFalse(UUID id);

    Optional<Employee> findByEmployeeNumberIgnoreCase(String employeeNumber);

    boolean existsByCompany_IdAndEmployeeNumberIgnoreCaseAndDeletedFalse(UUID companyId, String employeeNumber);

    boolean existsByCompany_IdAndEmployeeNumberIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String employeeNumber, UUID id);

    boolean existsByCompany_IdAndWorkEmailIgnoreCaseAndDeletedFalse(UUID companyId, String workEmail);

    boolean existsByCompany_IdAndWorkEmailIgnoreCaseAndIdNotAndDeletedFalse(UUID companyId, String workEmail, UUID id);

    @Query("""
            select e from Employee e
            join e.company c
            join e.branch b
            left join e.department d
            left join e.division div
            left join e.position p
            left join e.grade g
            left join e.jobLevel jl
            where e.deleted = false
              and (:companyId is null or c.id = :companyId)
              and (:branchId is null or b.id = :branchId)
              and (:departmentId is null or d.id = :departmentId)
              and (:positionId is null or p.id = :positionId)
              and (:status is null or e.employmentStatus = :status)
              and (cast(:search as string) is null
                   or lower(e.employeeNumber) like concat('%', lower(cast(:search as string)), '%')
                   or lower(e.firstName) like concat('%', lower(cast(:search as string)), '%')
                   or lower(e.lastName) like concat('%', lower(cast(:search as string)), '%')
                   or lower(e.workEmail) like concat('%', lower(cast(:search as string)), '%'))
            """)
    Page<Employee> search(
            @Param("search") String search,
            @Param("companyId") UUID companyId,
            @Param("branchId") UUID branchId,
            @Param("departmentId") UUID departmentId,
            @Param("positionId") UUID positionId,
            @Param("status") EmploymentStatus status,
            Pageable pageable
    );
}
