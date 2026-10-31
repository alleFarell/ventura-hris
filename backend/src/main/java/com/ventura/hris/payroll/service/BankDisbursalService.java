package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.payroll.dto.BankDisbursalBatchResponse;
import com.ventura.hris.payroll.dto.BankDisbursalGenerateRequest;
import com.ventura.hris.payroll.dto.BankDisbursalItemResponse;
import com.ventura.hris.payroll.entity.*;
import com.ventura.hris.payroll.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class BankDisbursalService {

    private final BankDisbursalBatchRepository batchRepository;
    private final BankDisbursalItemRepository itemRepository;
    private final PayrollRunRepository runRepository;
    private final PayrollRunItemRepository runItemRepository;
    private final EmployeeSalaryProfileRepository profileRepository;

    public BankDisbursalService(
            BankDisbursalBatchRepository batchRepository,
            BankDisbursalItemRepository itemRepository,
            PayrollRunRepository runRepository,
            PayrollRunItemRepository runItemRepository,
            EmployeeSalaryProfileRepository profileRepository
    ) {
        this.batchRepository = batchRepository;
        this.itemRepository = itemRepository;
        this.runRepository = runRepository;
        this.runItemRepository = runItemRepository;
        this.profileRepository = profileRepository;
    }

    public BankDisbursalBatchResponse generateDisbursalBatch(BankDisbursalGenerateRequest request) {
        PayrollRun run = runRepository.findById(request.payrollRunId())
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + request.payrollRunId()));

        String batchNumber = "DISB-" + request.bankCode().toUpperCase() + "-" +
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        BankDisbursalBatch batch = new BankDisbursalBatch();
        batch.setPayrollRun(run);
        batch.setBatchNumber(batchNumber);
        batch.setBankCode(request.bankCode().toUpperCase());
        batch.setStatus("GENERATED");
        batch.setGeneratedAt(Instant.now());

        BankDisbursalBatch savedBatch = batchRepository.save(batch);

        List<PayrollRunItem> items = runItemRepository.findByPayrollRunId(run.getId());
        BigDecimal totalAmount = BigDecimal.ZERO;
        int count = 0;

        StringBuilder fileBuilder = new StringBuilder();
        fileBuilder.append("// Ventura HRIS Disbursal Batch: ").append(batchNumber).append("\n");
        fileBuilder.append("// Bank: ").append(request.bankCode()).append(", Date: ").append(LocalDate.now()).append("\n");
        fileBuilder.append("AccountNumber,AccountHolder,Amount,BankCode,EmployeeNumber\n");

        for (PayrollRunItem item : items) {
            Employee emp = item.getEmployee();
            Optional<EmployeeSalaryProfile> profileOpt = profileRepository.findByEmployeeId(emp.getId());

            String bankName = profileOpt.map(EmployeeSalaryProfile::getBankName).orElse("BCA");
            String accNumber = profileOpt.map(EmployeeSalaryProfile::getBankAccountNumber).orElse("0000000000");
            String accHolder = profileOpt.map(EmployeeSalaryProfile::getBankAccountHolder).orElse(emp.getFirstName() + " " + (emp.getLastName() != null ? emp.getLastName() : ""));

            BankDisbursalItem disbursalItem = new BankDisbursalItem(
                    savedBatch, emp, bankName, accNumber, accHolder, item.getNetSalary()
            );
            disbursalItem.setStatus("PENDING");
            itemRepository.save(disbursalItem);

            totalAmount = totalAmount.add(item.getNetSalary());
            count++;

            fileBuilder.append(accNumber).append(",")
                    .append(accHolder).append(",")
                    .append(item.getNetSalary()).append(",")
                    .append(bankName).append(",")
                    .append(emp.getEmployeeNumber()).append("\n");
        }

        savedBatch.setTotalAmount(totalAmount);
        savedBatch.setTotalRecords(count);
        savedBatch.setFileContent(fileBuilder.toString());
        batchRepository.save(savedBatch);

        return mapToResponse(savedBatch);
    }

    @Transactional(readOnly = true)
    public List<BankDisbursalBatchResponse> getAllBatches() {
        return batchRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public BankDisbursalBatchResponse getBatchById(UUID id) {
        BankDisbursalBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disbursal batch not found with id: " + id));
        return mapToResponse(batch);
    }

    @Transactional(readOnly = true)
    public List<BankDisbursalItemResponse> getBatchItems(UUID batchId) {
        return itemRepository.findByBatchId(batchId).stream().map(this::mapItemToResponse).toList();
    }

    public BankDisbursalBatchResponse updateBatchStatus(UUID id, String status) {
        BankDisbursalBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disbursal batch not found with id: " + id));
        batch.setStatus(status);
        return mapToResponse(batchRepository.save(batch));
    }

    private BankDisbursalBatchResponse mapToResponse(BankDisbursalBatch b) {
        return new BankDisbursalBatchResponse(
                b.getId(),
                b.getPayrollRun().getId(),
                b.getPayrollRun().getRunNumber(),
                b.getBatchNumber(),
                b.getBankCode(),
                b.getTotalAmount(),
                b.getTotalRecords(),
                b.getStatus(),
                b.getFileContent(),
                b.getGeneratedAt(),
                b.getCreatedAt()
        );
    }

    private BankDisbursalItemResponse mapItemToResponse(BankDisbursalItem item) {
        return new BankDisbursalItemResponse(
                item.getId(),
                item.getBatch().getId(),
                item.getEmployee().getId(),
                item.getEmployee().getFirstName() + " " + (item.getEmployee().getLastName() != null ? item.getEmployee().getLastName() : ""),
                item.getEmployee().getEmployeeNumber(),
                item.getBankName(),
                item.getAccountNumber(),
                item.getAccountHolder(),
                item.getAmount(),
                item.getStatus(),
                item.getCreatedAt()
        );
    }
}
