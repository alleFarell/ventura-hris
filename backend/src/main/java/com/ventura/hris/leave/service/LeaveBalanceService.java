package com.ventura.hris.leave.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.leave.dto.LeaveBalanceAdjustRequest;
import com.ventura.hris.leave.dto.LeaveBalanceResponse;
import com.ventura.hris.leave.entity.LeaveBalance;
import com.ventura.hris.leave.entity.LeaveType;
import com.ventura.hris.leave.repository.LeaveBalanceRepository;
import com.ventura.hris.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveBalanceService {

    private final LeaveBalanceRepository balanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceService(
            LeaveBalanceRepository balanceRepository,
            LeaveTypeRepository leaveTypeRepository,
            EmployeeRepository employeeRepository
    ) {
        this.balanceRepository = balanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<LeaveBalanceResponse> getBalancesForEmployee(UUID employeeId, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<LeaveBalance> balances = balanceRepository.findByEmployeeIdAndYear(employeeId, targetYear);

        if (balances.isEmpty()) {
            List<LeaveType> activeTypes = leaveTypeRepository.findByIsActiveTrueOrderByCodeAsc();
            List<LeaveBalance> initialized = new ArrayList<>();
            for (LeaveType type : activeTypes) {
                LeaveBalance balance = new LeaveBalance();
                balance.setEmployee(employee);
                balance.setLeaveType(type);
                balance.setYear(targetYear);
                balance.setTotalQuota(type.getDefaultQuota());
                balance.setCarriedOver(0);
                balance.setUsed(0);
                balance.setPending(0);
                initialized.add(balanceRepository.save(balance));
            }
            return initialized.stream().map(LeaveBalanceResponse::fromEntity).collect(Collectors.toList());
        }

        return balances.stream().map(LeaveBalanceResponse::fromEntity).collect(Collectors.toList());
    }

    public LeaveBalanceResponse adjustBalance(LeaveBalanceAdjustRequest req) {
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", req.getEmployeeId()));
        LeaveType leaveType = leaveTypeRepository.findById(req.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", req.getLeaveTypeId()));

        LeaveBalance balance = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employee.getId(), leaveType.getId(), req.getYear()
        ).orElseGet(() -> {
            LeaveBalance newBal = new LeaveBalance();
            newBal.setEmployee(employee);
            newBal.setLeaveType(leaveType);
            newBal.setYear(req.getYear());
            return newBal;
        });

        balance.setTotalQuota(req.getTotalQuota());
        balance.setCarriedOver(req.getCarriedOver() != null ? req.getCarriedOver() : 0);
        LeaveBalance saved = balanceRepository.save(balance);
        return LeaveBalanceResponse.fromEntity(saved);
    }

    public void holdPending(UUID employeeId, UUID leaveTypeId, int days, int year) {
        LeaveBalance balance = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year)
                .orElseGet(() -> {
                    Employee employee = employeeRepository.findById(employeeId)
                            .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));
                    LeaveType type = leaveTypeRepository.findById(leaveTypeId)
                            .orElseThrow(() -> new ResourceNotFoundException("LeaveType", leaveTypeId));
                    LeaveBalance b = new LeaveBalance();
                    b.setEmployee(employee);
                    b.setLeaveType(type);
                    b.setYear(year);
                    b.setTotalQuota(type.getDefaultQuota());
                    return balanceRepository.save(b);
                });

        int remaining = balance.getRemainingQuota();
        if (remaining < days) {
            throw new DomainException(
                    "INSUFFICIENT_LEAVE_QUOTA",
                    String.format("Insufficient leave quota: requested %d days, but remaining balance is %d", days, remaining)
            );
        }

        balance.setPending(balance.getPending() + days);
        balanceRepository.save(balance);
    }

    public void restorePending(UUID employeeId, UUID leaveTypeId, int days, int year) {
        Optional<LeaveBalance> opt = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);
        opt.ifPresent(balance -> {
            balance.setPending(Math.max(0, balance.getPending() - days));
            balanceRepository.save(balance);
        });
    }

    public void finalizeApproval(UUID employeeId, UUID leaveTypeId, int days, int year) {
        Optional<LeaveBalance> opt = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);
        opt.ifPresent(balance -> {
            balance.setPending(Math.max(0, balance.getPending() - days));
            balance.setUsed(balance.getUsed() + days);
            balanceRepository.save(balance);
        });
    }

    public void restoreUsed(UUID employeeId, UUID leaveTypeId, int days, int year) {
        Optional<LeaveBalance> opt = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);
        opt.ifPresent(balance -> {
            balance.setUsed(Math.max(0, balance.getUsed() - days));
            balanceRepository.save(balance);
        });
    }
}
