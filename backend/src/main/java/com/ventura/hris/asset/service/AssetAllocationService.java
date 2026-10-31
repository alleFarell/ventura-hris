package com.ventura.hris.asset.service;

import com.ventura.hris.asset.dto.AssetAllocationRequest;
import com.ventura.hris.asset.dto.AssetAllocationResponse;
import com.ventura.hris.asset.dto.AssetReturnRequest;
import com.ventura.hris.asset.entity.AssetAllocation;
import com.ventura.hris.asset.entity.CompanyAsset;
import com.ventura.hris.asset.repository.AssetAllocationRepository;
import com.ventura.hris.asset.repository.CompanyAssetRepository;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetAllocationService {

    private final AssetAllocationRepository allocationRepository;
    private final CompanyAssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    public AssetAllocationService(AssetAllocationRepository allocationRepository,
                                  CompanyAssetRepository assetRepository,
                                  EmployeeRepository employeeRepository) {
        this.allocationRepository = allocationRepository;
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
    }

    public AssetAllocationResponse allocateAsset(AssetAllocationRequest request) {
        CompanyAsset asset = assetRepository.findById(request.assetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + request.assetId()));

        if (!"AVAILABLE".equalsIgnoreCase(asset.getStatus())) {
            throw new DomainException("ASSET_NOT_AVAILABLE", "Asset is currently " + asset.getStatus() + " and cannot be allocated");
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.employeeId()));

        // Mark asset as ALLOCATED
        asset.setStatus("ALLOCATED");
        assetRepository.save(asset);

        AssetAllocation allocation = new AssetAllocation();
        allocation.setAsset(asset);
        allocation.setEmployee(employee);
        allocation.setAllocatedDate(request.allocatedDate());
        allocation.setHandoverNotes(request.handoverNotes());
        allocation.setStatus("ACTIVE");

        AssetAllocation saved = allocationRepository.save(allocation);
        return mapToResponse(saved);
    }

    public AssetAllocationResponse returnAsset(UUID allocationId, AssetReturnRequest request) {
        AssetAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset allocation not found: " + allocationId));

        if (!"ACTIVE".equalsIgnoreCase(allocation.getStatus())) {
            throw new DomainException("ALREADY_RETURNED", "This asset allocation has already been marked as returned");
        }

        allocation.setStatus("RETURNED");
        allocation.setReturnDate(request.returnDate());
        allocation.setReturnNotes(request.returnNotes());

        // Restore asset to AVAILABLE
        CompanyAsset asset = allocation.getAsset();
        if (asset != null) {
            asset.setStatus("AVAILABLE");
            if (request.conditionGrade() != null && !request.conditionGrade().isBlank()) {
                asset.setConditionGrade(request.conditionGrade().trim().toUpperCase());
            }
            assetRepository.save(asset);
        }

        AssetAllocation updated = allocationRepository.save(allocation);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<AssetAllocationResponse> getAllocations(UUID assetId, UUID employeeId, String status) {
        List<AssetAllocation> list;
        if (assetId != null && status != null && !status.isBlank()) {
            list = allocationRepository.findByAssetIdAndStatus(assetId, status.trim().toUpperCase());
        } else if (employeeId != null && status != null && !status.isBlank()) {
            list = allocationRepository.findByEmployeeIdAndStatus(employeeId, status.trim().toUpperCase());
        } else if (assetId != null) {
            list = allocationRepository.findByAssetId(assetId);
        } else if (employeeId != null) {
            list = allocationRepository.findByEmployeeId(employeeId);
        } else {
            list = allocationRepository.findAll();
        }

        if (status != null && !status.isBlank() && assetId == null && employeeId == null) {
            list = list.stream().filter(a -> status.equalsIgnoreCase(a.getStatus())).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssetAllocationResponse getAllocationById(UUID id) {
        AssetAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset allocation not found: " + id));
        return mapToResponse(allocation);
    }

    private AssetAllocationResponse mapToResponse(AssetAllocation alloc) {
        String empName = "";
        String empNumber = "";
        if (alloc.getEmployee() != null) {
            empName = alloc.getEmployee().getFirstName() + " " + (alloc.getEmployee().getLastName() != null ? alloc.getEmployee().getLastName() : "");
            empName = empName.trim();
            empNumber = alloc.getEmployee().getEmployeeNumber();
        }

        String tag = alloc.getAsset() != null ? alloc.getAsset().getAssetTag() : "";
        String name = alloc.getAsset() != null ? alloc.getAsset().getName() : "";
        String model = alloc.getAsset() != null ? alloc.getAsset().getModel() : "";

        return new AssetAllocationResponse(
                alloc.getId(),
                alloc.getAsset() != null ? alloc.getAsset().getId() : null,
                tag,
                name,
                model,
                alloc.getEmployee() != null ? alloc.getEmployee().getId() : null,
                empName,
                empNumber,
                alloc.getAllocatedDate(),
                alloc.getReturnDate(),
                alloc.getHandoverNotes(),
                alloc.getReturnNotes(),
                alloc.getStatus(),
                alloc.getCreatedAt(),
                alloc.getUpdatedAt()
        );
    }
}
