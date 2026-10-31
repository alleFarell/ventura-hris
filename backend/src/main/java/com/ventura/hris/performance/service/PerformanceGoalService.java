package com.ventura.hris.performance.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.performance.dto.*;
import com.ventura.hris.performance.entity.PerformanceCycle;
import com.ventura.hris.performance.entity.PerformanceGoal;
import com.ventura.hris.performance.entity.PerformanceGoalKeyResult;
import com.ventura.hris.performance.repository.PerformanceCycleRepository;
import com.ventura.hris.performance.repository.PerformanceGoalKeyResultRepository;
import com.ventura.hris.performance.repository.PerformanceGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PerformanceGoalService {

    private final PerformanceGoalRepository goalRepository;
    private final PerformanceGoalKeyResultRepository keyResultRepository;
    private final PerformanceCycleRepository cycleRepository;
    private final EmployeeRepository employeeRepository;

    public PerformanceGoalService(PerformanceGoalRepository goalRepository,
                                  PerformanceGoalKeyResultRepository keyResultRepository,
                                  PerformanceCycleRepository cycleRepository,
                                  EmployeeRepository employeeRepository) {
        this.goalRepository = goalRepository;
        this.keyResultRepository = keyResultRepository;
        this.cycleRepository = cycleRepository;
        this.employeeRepository = employeeRepository;
    }

    public PerformanceGoalResponse createGoal(PerformanceGoalRequest request) {
        PerformanceCycle cycle = cycleRepository.findById(request.cycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Performance cycle not found: " + request.cycleId()));

        if ("CLOSED".equalsIgnoreCase(cycle.getStatus())) {
            throw new DomainException("CYCLE_CLOSED", "Cannot add goals to a closed performance cycle");
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.employeeId()));

        PerformanceGoal goal = new PerformanceGoal();
        goal.setCycle(cycle);
        goal.setEmployee(employee);
        goal.setTitle(request.title());
        goal.setDescription(request.description());
        goal.setCategory(request.category() != null ? request.category() : "INDIVIDUAL");
        goal.setWeight(request.weight() != null ? request.weight() : 100);
        goal.setStatus("ACTIVE");
        goal.setProgressPercent(BigDecimal.ZERO);

        if (request.keyResults() != null && !request.keyResults().isEmpty()) {
            BigDecimal sumProgress = BigDecimal.ZERO;
            for (PerformanceGoalKeyResultDto krDto : request.keyResults()) {
                PerformanceGoalKeyResult kr = new PerformanceGoalKeyResult();
                kr.setDescription(krDto.description());
                kr.setMetricType(krDto.metricType() != null ? krDto.metricType() : "PERCENTAGE");
                kr.setTargetValue(krDto.targetValue());
                kr.setCurrentValue(krDto.currentValue() != null ? krDto.currentValue() : BigDecimal.ZERO);
                kr.setNotes(krDto.notes());

                BigDecimal krProgress = calculateProgress(kr.getCurrentValue(), kr.getTargetValue());
                kr.setProgressPercent(krProgress);
                sumProgress = sumProgress.add(krProgress);

                goal.addKeyResult(kr);
            }
            BigDecimal avgProgress = sumProgress.divide(BigDecimal.valueOf(request.keyResults().size()), 2, RoundingMode.HALF_UP);
            goal.setProgressPercent(avgProgress);
        }

        PerformanceGoal saved = goalRepository.save(goal);
        return mapToResponse(saved);
    }

    public List<PerformanceGoalResponse> getGoals(UUID cycleId, UUID employeeId) {
        List<PerformanceGoal> list;
        if (cycleId != null && employeeId != null) {
            list = goalRepository.findByCycleIdAndEmployeeId(cycleId, employeeId);
        } else if (cycleId != null) {
            list = goalRepository.findByCycleId(cycleId);
        } else if (employeeId != null) {
            list = goalRepository.findByEmployeeId(employeeId);
        } else {
            list = goalRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PerformanceGoalResponse getGoal(UUID id) {
        PerformanceGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Performance goal not found: " + id));
        return mapToResponse(goal);
    }

    public PerformanceGoalResponse updateKeyResultProgress(UUID goalId, UUID krId, KeyResultProgressUpdateRequest request) {
        PerformanceGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Performance goal not found: " + goalId));

        PerformanceGoalKeyResult kr = keyResultRepository.findById(krId)
                .orElseThrow(() -> new ResourceNotFoundException("Key result not found: " + krId));

        if (!kr.getGoal().getId().equals(goal.getId())) {
            throw new DomainException("INVALID_KEY_RESULT", "Key result does not belong to the specified goal");
        }

        kr.setCurrentValue(request.currentValue());
        BigDecimal krProgress = calculateProgress(kr.getCurrentValue(), kr.getTargetValue());
        kr.setProgressPercent(krProgress);
        if (request.notes() != null && !request.notes().isBlank()) {
            kr.setNotes(request.notes());
        }
        keyResultRepository.save(kr);

        // Recalculate goal overall progress
        List<PerformanceGoalKeyResult> allKrs = keyResultRepository.findByGoalId(goalId);
        if (!allKrs.isEmpty()) {
            BigDecimal sumProgress = allKrs.stream()
                    .map(PerformanceGoalKeyResult::getProgressPercent)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal avgProgress = sumProgress.divide(BigDecimal.valueOf(allKrs.size()), 2, RoundingMode.HALF_UP);
            goal.setProgressPercent(avgProgress);

            if (avgProgress.compareTo(BigDecimal.valueOf(100.00)) >= 0) {
                goal.setStatus("COMPLETED");
            }
            goalRepository.save(goal);
        }

        return mapToResponse(goal);
    }

    private BigDecimal calculateProgress(BigDecimal current, BigDecimal target) {
        if (target == null || target.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal progress = current.divide(target, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
        if (progress.compareTo(BigDecimal.valueOf(100.00)) > 0) {
            return BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP);
        }
        if (progress.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return progress;
    }

    private PerformanceGoalResponse mapToResponse(PerformanceGoal g) {
        String empNum = g.getEmployee() != null ? g.getEmployee().getEmployeeNumber() : "";
        String empName = g.getEmployee() != null
                ? g.getEmployee().getFirstName() + " " + (g.getEmployee().getLastName() != null ? g.getEmployee().getLastName() : "")
                : "";

        List<PerformanceGoalKeyResultDto> krs = g.getKeyResults().stream()
                .map(k -> new PerformanceGoalKeyResultDto(
                        k.getId(),
                        k.getDescription(),
                        k.getMetricType(),
                        k.getTargetValue(),
                        k.getCurrentValue(),
                        k.getProgressPercent(),
                        k.getNotes()
                ))
                .collect(Collectors.toList());

        return new PerformanceGoalResponse(
                g.getId(),
                g.getCycle() != null ? g.getCycle().getId() : null,
                g.getCycle() != null ? g.getCycle().getName() : "",
                g.getEmployee() != null ? g.getEmployee().getId() : null,
                empNum,
                empName.trim(),
                g.getTitle(),
                g.getDescription(),
                g.getCategory(),
                g.getWeight(),
                g.getStatus(),
                g.getProgressPercent(),
                krs,
                g.getCreatedAt()
        );
    }
}
