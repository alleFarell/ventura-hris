package com.ventura.hris.employee.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.dto.ChangeStatusRequest;
import com.ventura.hris.employee.dto.ContractResponse;
import com.ventura.hris.employee.dto.CreateContractRequest;
import com.ventura.hris.employee.dto.CreateDocumentRequest;
import com.ventura.hris.employee.dto.CreateEmergencyContactRequest;
import com.ventura.hris.employee.dto.DocumentResponse;
import com.ventura.hris.employee.dto.EmergencyContactResponse;
import com.ventura.hris.employee.dto.PersonalInformationRequest;
import com.ventura.hris.employee.dto.PersonalInformationResponse;
import com.ventura.hris.employee.dto.StatusHistoryResponse;
import com.ventura.hris.employee.entity.ContractType;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmployeeDocument;
import com.ventura.hris.employee.entity.EmployeeEmergencyContact;
import com.ventura.hris.employee.entity.EmployeePersonalInformation;
import com.ventura.hris.employee.entity.EmploymentContract;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.entity.EmploymentStatusHistory;
import com.ventura.hris.employee.repository.EmployeeDocumentRepository;
import com.ventura.hris.employee.repository.EmployeeEmergencyContactRepository;
import com.ventura.hris.employee.repository.EmployeePersonalInformationRepository;
import com.ventura.hris.employee.repository.EmploymentContractRepository;
import com.ventura.hris.employee.repository.EmploymentStatusHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class EmployeeProfileService {

    private final EmployeeService employeeService;
    private final EmployeePersonalInformationRepository personalInfoRepository;
    private final EmployeeEmergencyContactRepository emergencyContactRepository;
    private final EmploymentContractRepository contractRepository;
    private final EmploymentStatusHistoryRepository statusHistoryRepository;
    private final EmployeeDocumentRepository documentRepository;

    public EmployeeProfileService(
            EmployeeService employeeService,
            EmployeePersonalInformationRepository personalInfoRepository,
            EmployeeEmergencyContactRepository emergencyContactRepository,
            EmploymentContractRepository contractRepository,
            EmploymentStatusHistoryRepository statusHistoryRepository,
            EmployeeDocumentRepository documentRepository
    ) {
        this.employeeService = employeeService;
        this.personalInfoRepository = personalInfoRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.contractRepository = contractRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.documentRepository = documentRepository;
    }

    // ==================== PERSONAL INFORMATION ====================

    @Transactional(readOnly = true)
    public PersonalInformationResponse getPersonalInformation(UUID employeeId) {
        Employee employee = employeeService.getEmployee(employeeId);
        return personalInfoRepository.findByEmployee_IdAndDeletedFalse(employee.getId())
                .map(this::toPersonalInfoResponse)
                .orElseGet(() -> new PersonalInformationResponse(
                        null, employee.getId(), null, null, null, null, null, null, null, null, null, null, null
                ));
    }

    @Transactional
    public PersonalInformationResponse updatePersonalInformation(UUID employeeId, PersonalInformationRequest request) {
        Employee employee = employeeService.getEmployee(employeeId);

        EmployeePersonalInformation info = personalInfoRepository.findByEmployee_IdAndDeletedFalse(employee.getId())
                .orElseGet(() -> new EmployeePersonalInformation(
                        employee,
                        request.birthDate(),
                        request.birthPlace(),
                        request.gender(),
                        request.maritalStatus(),
                        request.nationality(),
                        request.identityNumber(),
                        request.taxNumber(),
                        request.personalEmail(),
                        request.personalPhone(),
                        request.address()
                ));

        info.setBirthDate(request.birthDate());
        info.setBirthPlace(request.birthPlace());
        info.setGender(request.gender());
        info.setMaritalStatus(request.maritalStatus());
        info.setNationality(request.nationality());
        info.setIdentityNumber(request.identityNumber());
        info.setTaxNumber(request.taxNumber());
        info.setPersonalEmail(request.personalEmail());
        info.setPersonalPhone(request.personalPhone());
        info.setAddress(request.address());

        return toPersonalInfoResponse(personalInfoRepository.save(info));
    }

    // ==================== EMERGENCY CONTACTS ====================

    @Transactional(readOnly = true)
    public List<EmergencyContactResponse> listEmergencyContacts(UUID employeeId) {
        Employee employee = employeeService.getEmployee(employeeId);
        return emergencyContactRepository.findByEmployee_IdAndDeletedFalseOrderByPrimaryContactDescCreatedAtAsc(employee.getId())
                .stream()
                .map(this::toEmergencyContactResponse)
                .toList();
    }

    @Transactional
    public EmergencyContactResponse createEmergencyContact(UUID employeeId, CreateEmergencyContactRequest request) {
        Employee employee = employeeService.getEmployee(employeeId);

        if (request.primaryContact()) {
            List<EmployeeEmergencyContact> existing = emergencyContactRepository
                    .findByEmployee_IdAndDeletedFalseOrderByPrimaryContactDescCreatedAtAsc(employee.getId());
            for (EmployeeEmergencyContact contact : existing) {
                if (contact.isPrimaryContact()) {
                    contact.setPrimaryContact(false);
                }
            }
        }

        EmployeeEmergencyContact contact = new EmployeeEmergencyContact(
                employee,
                request.name().trim(),
                request.relationship().trim(),
                request.phone().trim(),
                request.email() != null ? request.email().trim() : null,
                request.primaryContact()
        );

        return toEmergencyContactResponse(emergencyContactRepository.save(contact));
    }

    @Transactional
    public void deleteEmergencyContact(UUID employeeId, UUID contactId) {
        EmployeeEmergencyContact contact = emergencyContactRepository.findByIdAndDeletedFalse(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyContact"));
        if (!contact.getEmployee().getId().equals(employeeId)) {
            throw new DomainException("INVALID_CONTACT", "Contact does not belong to the employee", HttpStatus.BAD_REQUEST);
        }
        contact.setDeleted(true);
    }

    // ==================== EMPLOYMENT CONTRACTS ====================

    @Transactional(readOnly = true)
    public List<ContractResponse> listContracts(UUID employeeId) {
        Employee employee = employeeService.getEmployee(employeeId);
        return contractRepository.findByEmployee_IdAndDeletedFalseOrderByStartDateDesc(employee.getId())
                .stream()
                .map(this::toContractResponse)
                .toList();
    }

    @Transactional
    public ContractResponse createContract(UUID employeeId, CreateContractRequest request) {
        Employee employee = employeeService.getEmployee(employeeId);

        ContractType contractType;
        try {
            contractType = ContractType.valueOf(request.contractType().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new DomainException("INVALID_CONTRACT_TYPE", "Invalid contract type: " + request.contractType(), HttpStatus.BAD_REQUEST);
        }

        if (contractType == ContractType.FIXED_TERM && request.endDate() == null) {
            throw new DomainException("INVALID_CONTRACT_DATES", "End date is required for fixed-term contracts", HttpStatus.BAD_REQUEST);
        }

        if (request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new DomainException("INVALID_CONTRACT_DATES", "Contract end date cannot be before start date", HttpStatus.BAD_REQUEST);
        }

        // Validate overlapping active contracts
        List<EmploymentContract> overlapping = contractRepository.findOverlappingContracts(
                employee.getId(), request.startDate(), request.endDate(), null
        );
        if (!overlapping.isEmpty()) {
            throw new DomainException("EMPLOYEE_CONTRACT_DATE_OVERLAP", "Contract dates overlap with an existing active contract", HttpStatus.BAD_REQUEST);
        }

        EmploymentContract contract = new EmploymentContract(
                employee,
                contractType,
                request.startDate(),
                request.endDate(),
                StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE",
                request.documentId()
        );

        return toContractResponse(contractRepository.save(contract));
    }

    // ==================== STATUS LIFECYCLE & HISTORIES ====================

    @Transactional
    public StatusHistoryResponse changeStatus(UUID employeeId, ChangeStatusRequest request) {
        Employee employee = employeeService.getEmployee(employeeId);
        EmploymentStatus currentStatus = employee.getEmploymentStatus();

        if (currentStatus == EmploymentStatus.TERMINATED) {
            throw new DomainException("EMPLOYEE_STATUS_TRANSITION_INVALID", "Cannot transition from TERMINATED status", HttpStatus.BAD_REQUEST);
        }

        EmploymentStatus targetStatus;
        try {
            targetStatus = EmploymentStatus.valueOf(request.newStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new DomainException("EMPLOYEE_STATUS_TRANSITION_INVALID", "Invalid employment status: " + request.newStatus(), HttpStatus.BAD_REQUEST);
        }

        if (currentStatus == targetStatus) {
            throw new DomainException("EMPLOYEE_STATUS_TRANSITION_INVALID", "Target status is already " + targetStatus, HttpStatus.BAD_REQUEST);
        }

        if (targetStatus == EmploymentStatus.ACTIVE) {
            if (employee.getBranch() == null || employee.getDepartment() == null ||
                    employee.getPosition() == null || employee.getHireDate() == null) {
                throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Active employee requires branch, department, position, and hire date", HttpStatus.BAD_REQUEST);
            }
        }

        EmploymentStatusHistory history = new EmploymentStatusHistory(
                employee,
                currentStatus.name(),
                targetStatus.name(),
                request.effectiveDate(),
                request.reason()
        );
        EmploymentStatusHistory savedHistory = statusHistoryRepository.save(history);

        employee.setEmploymentStatus(targetStatus);
        if (targetStatus == EmploymentStatus.TERMINATED) {
            employee.setTerminationDate(request.effectiveDate());
        }

        return toStatusHistoryResponse(savedHistory);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getStatusHistory(UUID employeeId) {
        Employee employee = employeeService.getEmployee(employeeId);
        return statusHistoryRepository.findByEmployee_IdAndDeletedFalseOrderByEffectiveDateDescCreatedAtDesc(employee.getId())
                .stream()
                .map(this::toStatusHistoryResponse)
                .toList();
    }

    // ==================== DOCUMENT METADATA ====================

    @Transactional(readOnly = true)
    public List<DocumentResponse> listDocuments(UUID employeeId) {
        Employee employee = employeeService.getEmployee(employeeId);
        return documentRepository.findByEmployee_IdAndDeletedFalseOrderByCreatedAtDesc(employee.getId())
                .stream()
                .map(this::toDocumentResponse)
                .toList();
    }

    @Transactional
    public DocumentResponse createDocument(UUID employeeId, CreateDocumentRequest request) {
        Employee employee = employeeService.getEmployee(employeeId);

        EmployeeDocument document = new EmployeeDocument(
                employee,
                request.documentType().trim(),
                request.fileName().trim(),
                request.storageReference() != null ? request.storageReference().trim() : null,
                request.accessClassification(),
                request.retentionCategory(),
                request.expiresAt(),
                request.status()
        );

        return toDocumentResponse(documentRepository.save(document));
    }

    // ==================== MAPPERS ====================

    private PersonalInformationResponse toPersonalInfoResponse(EmployeePersonalInformation info) {
        return new PersonalInformationResponse(
                info.getId(),
                info.getEmployee().getId(),
                info.getBirthDate(),
                info.getBirthPlace(),
                info.getGender(),
                info.getMaritalStatus(),
                info.getNationality(),
                info.getIdentityNumber(),
                info.getTaxNumber(),
                info.getPersonalEmail(),
                info.getPersonalPhone(),
                info.getAddress(),
                info.getUpdatedAt()
        );
    }

    private EmergencyContactResponse toEmergencyContactResponse(EmployeeEmergencyContact contact) {
        return new EmergencyContactResponse(
                contact.getId(),
                contact.getEmployee().getId(),
                contact.getName(),
                contact.getRelationship(),
                contact.getPhone(),
                contact.getEmail(),
                contact.isPrimaryContact(),
                contact.getCreatedAt()
        );
    }

    private ContractResponse toContractResponse(EmploymentContract contract) {
        return new ContractResponse(
                contract.getId(),
                contract.getEmployee().getId(),
                contract.getContractType(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getStatus(),
                contract.getDocumentId(),
                contract.getCreatedAt(),
                contract.getVersion()
        );
    }

    private StatusHistoryResponse toStatusHistoryResponse(EmploymentStatusHistory history) {
        return new StatusHistoryResponse(
                history.getId(),
                history.getEmployee().getId(),
                history.getOldStatus(),
                history.getNewStatus(),
                history.getEffectiveDate(),
                history.getReason(),
                history.getCreatedAt()
        );
    }

    private DocumentResponse toDocumentResponse(EmployeeDocument document) {
        return new DocumentResponse(
                document.getId(),
                document.getEmployee().getId(),
                document.getDocumentType(),
                document.getFileName(),
                document.getStorageReference(),
                document.getAccessClassification(),
                document.getRetentionCategory(),
                document.getExpiresAt(),
                document.getStatus(),
                document.getCreatedAt()
        );
    }
}
