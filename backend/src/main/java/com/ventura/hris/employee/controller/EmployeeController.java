package com.ventura.hris.employee.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.api.PageMeta;
import com.ventura.hris.employee.dto.ChangeStatusRequest;
import com.ventura.hris.employee.dto.ContractResponse;
import com.ventura.hris.employee.dto.CreateContractRequest;
import com.ventura.hris.employee.dto.CreateDocumentRequest;
import com.ventura.hris.employee.dto.CreateEmergencyContactRequest;
import com.ventura.hris.employee.dto.CreateEmployeeRequest;
import com.ventura.hris.employee.dto.DocumentResponse;
import com.ventura.hris.employee.dto.EmergencyContactResponse;
import com.ventura.hris.employee.dto.EmployeeSummaryResponse;
import com.ventura.hris.employee.dto.PersonalInformationRequest;
import com.ventura.hris.employee.dto.PersonalInformationResponse;
import com.ventura.hris.employee.dto.StatusHistoryResponse;
import com.ventura.hris.employee.dto.UpdateEmployeeRequest;
import com.ventura.hris.employee.service.EmployeeProfileService;
import com.ventura.hris.employee.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeProfileService employeeProfileService;

    public EmployeeController(EmployeeService employeeService, EmployeeProfileService employeeProfileService) {
        this.employeeService = employeeService;
        this.employeeProfileService = employeeProfileService;
    }

    // ==================== MASTER ENDPOINTS ====================

    @GetMapping
    public ApiResponse<List<EmployeeSummaryResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID positionId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "employeeNumber") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<EmployeeSummaryResponse> result = employeeService.search(
                search, companyId, branchId, departmentId, positionId, status, pageable(page, size, sort, direction)
        );
        return ApiResponse.success(result.getContent(), "Employees loaded", PageMeta.from(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeSummaryResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(employeeService.get(id), "Employee loaded");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeSummaryResponse>> create(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employeeService.create(request), "Employee created"));
    }

    @PutMapping("/{id}")
    public ApiResponse<EmployeeSummaryResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeRequest request
    ) {
        return ApiResponse.success(employeeService.update(id, request), "Employee updated");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        employeeService.delete(id);
        return ApiResponse.success(null, "Employee deleted");
    }

    // ==================== PERSONAL INFORMATION ====================

    @GetMapping("/{id}/personal-information")
    public ApiResponse<PersonalInformationResponse> getPersonalInformation(@PathVariable UUID id) {
        return ApiResponse.success(employeeProfileService.getPersonalInformation(id), "Personal information loaded");
    }

    @PutMapping("/{id}/personal-information")
    public ApiResponse<PersonalInformationResponse> updatePersonalInformation(
            @PathVariable UUID id,
            @Valid @RequestBody PersonalInformationRequest request
    ) {
        return ApiResponse.success(employeeProfileService.updatePersonalInformation(id, request), "Personal information updated");
    }

    // ==================== EMERGENCY CONTACTS ====================

    @GetMapping("/{id}/emergency-contacts")
    public ApiResponse<List<EmergencyContactResponse>> listEmergencyContacts(@PathVariable UUID id) {
        return ApiResponse.success(employeeProfileService.listEmergencyContacts(id), "Emergency contacts loaded");
    }

    @PostMapping("/{id}/emergency-contacts")
    public ResponseEntity<ApiResponse<EmergencyContactResponse>> createEmergencyContact(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEmergencyContactRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employeeProfileService.createEmergencyContact(id, request), "Emergency contact created"));
    }

    @DeleteMapping("/{id}/emergency-contacts/{contactId}")
    public ApiResponse<Void> deleteEmergencyContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId
    ) {
        employeeProfileService.deleteEmergencyContact(id, contactId);
        return ApiResponse.success(null, "Emergency contact deleted");
    }

    // ==================== EMPLOYMENT CONTRACTS ====================

    @GetMapping("/{id}/contracts")
    public ApiResponse<List<ContractResponse>> listContracts(@PathVariable UUID id) {
        return ApiResponse.success(employeeProfileService.listContracts(id), "Employment contracts loaded");
    }

    @PostMapping("/{id}/contracts")
    public ResponseEntity<ApiResponse<ContractResponse>> createContract(
            @PathVariable UUID id,
            @Valid @RequestBody CreateContractRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employeeProfileService.createContract(id, request), "Contract created"));
    }

    // ==================== STATUS LIFECYCLE ====================

    @PostMapping("/{id}/status-changes")
    public ApiResponse<StatusHistoryResponse> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request
    ) {
        return ApiResponse.success(employeeProfileService.changeStatus(id, request), "Employment status updated");
    }

    @GetMapping("/{id}/status-history")
    public ApiResponse<List<StatusHistoryResponse>> getStatusHistory(@PathVariable UUID id) {
        return ApiResponse.success(employeeProfileService.getStatusHistory(id), "Status history loaded");
    }

    // ==================== DOCUMENT METADATA ====================

    @GetMapping("/{id}/documents")
    public ApiResponse<List<DocumentResponse>> listDocuments(@PathVariable UUID id) {
        return ApiResponse.success(employeeProfileService.listDocuments(id), "Documents loaded");
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<DocumentResponse>> createDocument(
            @PathVariable UUID id,
            @Valid @RequestBody CreateDocumentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employeeProfileService.createDocument(id, request), "Document metadata created"));
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sort));
    }
}
