package com.ventura.hris.attendance.repository;

import com.ventura.hris.attendance.entity.RosterAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RosterAssignmentRepository extends JpaRepository<RosterAssignment, UUID> {

    Optional<RosterAssignment> findByEmployeeIdAndShiftDate(UUID employeeId, LocalDate shiftDate);

    List<RosterAssignment> findByEmployeeIdAndShiftDateBetweenOrderByShiftDateAsc(
            UUID employeeId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT r FROM RosterAssignment r JOIN FETCH r.employee e LEFT JOIN FETCH r.shift s " +
           "WHERE r.shiftDate BETWEEN :startDate AND :endDate ORDER BY r.shiftDate ASC")
    List<RosterAssignment> findRosterBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    void deleteByEmployeeIdAndShiftDateBetween(UUID employeeId, LocalDate startDate, LocalDate endDate);
}
