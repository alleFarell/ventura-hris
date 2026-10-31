package com.ventura.hris.employee.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.dto.CreateEmployeeRequest;
import com.ventura.hris.employee.dto.EmployeeSummaryResponse;
import com.ventura.hris.employee.dto.UpdateEmployeeRequest;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.entity.EmploymentStatusHistory;
import com.ventura.hris.employee.repository.EmployeeEmergencyContactRepository;
import com.ventura.hris.employee.repository.EmployeePersonalInformationRepository;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.employee.repository.EmploymentContractRepository;
import com.ventura.hris.employee.repository.EmploymentStatusHistoryRepository;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Division;
import com.ventura.hris.organization.entity.Grade;
import com.ventura.hris.organization.entity.JobLevel;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.DivisionRepository;
import com.ventura.hris.organization.repository.GradeRepository;
import com.ventura.hris.organization.repository.JobLevelRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.setup.entity.Branch;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.entity.RecordStatus;
import com.ventura.hris.setup.repository.BranchRepository;
import com.ventura.hris.setup.repository.CompanyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final DivisionRepository divisionRepository;
    private final PositionRepository positionRepository;
    private final GradeRepository gradeRepository;
    private final JobLevelRepository jobLevelRepository;
    private final EmploymentStatusHistoryRepository statusHistoryRepository;
    private final EmployeePersonalInformationRepository personalInfoRepository;
    private final EmployeeEmergencyContactRepository emergencyContactRepository;
    private final EmploymentContractRepository contractRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            CompanyRepository companyRepository,
            BranchRepository branchRepository,
            DepartmentRepository departmentRepository,
            DivisionRepository divisionRepository,
            PositionRepository positionRepository,
            GradeRepository gradeRepository,
            JobLevelRepository jobLevelRepository,
            EmploymentStatusHistoryRepository statusHistoryRepository,
            EmployeePersonalInformationRepository personalInfoRepository,
            EmployeeEmergencyContactRepository emergencyContactRepository,
            EmploymentContractRepository contractRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.branchRepository = branchRepository;
        this.departmentRepository = departmentRepository;
        this.divisionRepository = divisionRepository;
        this.positionRepository = positionRepository;
        this.gradeRepository = gradeRepository;
        this.jobLevelRepository = jobLevelRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.personalInfoRepository = personalInfoRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.contractRepository = contractRepository;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeSummaryResponse> search(
            String search,
            UUID companyId,
            UUID branchId,
            UUID departmentId,
            UUID positionId,
            String status,
            Pageable pageable
    ) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        EmploymentStatus parsedStatus = null;
        if (StringUtils.hasText(status)) {
            try {
                parsedStatus = EmploymentStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return employeeRepository.search(normalizedSearch, companyId, branchId, departmentId, positionId, parsedStatus, pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public EmployeeSummaryResponse get(UUID id) {
        return toSummaryResponse(getEmployee(id));
    }

    @Transactional
    public EmployeeSummaryResponse create(CreateEmployeeRequest request) {
        Company company = companyRepository.findByIdAndDeletedFalse(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company"));

        Branch branch = branchRepository.findByIdAndDeletedFalse(request.branchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch"));
        if (!branch.getCompany().getId().equals(company.getId())) {
            throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Branch does not belong to the employee's company", HttpStatus.BAD_REQUEST);
        }

        String empNumber = request.employeeNumber().trim();
        if (employeeRepository.existsByCompany_IdAndEmployeeNumberIgnoreCaseAndDeletedFalse(company.getId(), empNumber)) {
            throw new DomainException("EMPLOYEE_NUMBER_DUPLICATE", "Employee number already exists for this company", HttpStatus.CONFLICT);
        }

        String workEmail = StringUtils.hasText(request.workEmail()) ? request.workEmail().trim().toLowerCase() : null;
        if (workEmail != null && employeeRepository.existsByCompany_IdAndWorkEmailIgnoreCaseAndDeletedFalse(company.getId(), workEmail)) {
            throw new DomainException("EMPLOYEE_EMAIL_DUPLICATE", "Work email already exists for this company", HttpStatus.CONFLICT);
        }

        Department department = null;
        if (request.departmentId() != null) {
            department = departmentRepository.findByIdAndDeletedFalse(request.departmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department"));
            if (!department.getCompany().getId().equals(company.getId())) {
                throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Department belongs to another company", HttpStatus.BAD_REQUEST);
            }
        }

        Division division = null;
        if (request.divisionId() != null) {
            division = divisionRepository.findByIdAndDeletedFalse(request.divisionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Division"));
            if (department != null && !division.getDepartment().getId().equals(department.getId())) {
                throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Division does not belong to the selected department", HttpStatus.BAD_REQUEST);
            }
        }

        Position position = null;
        if (request.positionId() != null) {
            position = positionRepository.findByIdAndDeletedFalse(request.positionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Position"));
            if (!position.getCompany().getId().equals(company.getId())) {
                throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Position belongs to another company", HttpStatus.BAD_REQUEST);
            }
        }

        Grade grade = null;
        if (request.gradeId() != null) {
            grade = gradeRepository.findByIdAndDeletedFalse(request.gradeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grade"));
        }

        JobLevel jobLevel = null;
        if (request.jobLevelId() != null) {
            jobLevel = jobLevelRepository.findByIdAndDeletedFalse(request.jobLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobLevel"));
        }

        EmploymentStatus status = EmploymentStatus.CANDIDATE;
        if (StringUtils.hasText(request.employmentStatus())) {
            try {
                status = EmploymentStatus.valueOf(request.employmentStatus().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new DomainException("EMPLOYEE_STATUS_TRANSITION_INVALID", "Invalid employment status: " + request.employmentStatus(), HttpStatus.BAD_REQUEST);
            }
        }

        // Active status validation rules
        if (status == EmploymentStatus.ACTIVE) {
            if (department == null || position == null || request.hireDate() == null) {
                throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Active employee requires department, position, and hire date", HttpStatus.BAD_REQUEST);
            }
        }

        Employee employee = new Employee(
                company,
                branch,
                department,
                division,
                position,
                grade,
                jobLevel,
                empNumber,
                request.firstName().trim(),
                request.lastName() != null ? request.lastName().trim() : null,
                workEmail,
                status,
                request.hireDate()
        );

        Employee savedEmployee = employeeRepository.save(employee);

        // Record initial status history
        EmploymentStatusHistory initialHistory = new EmploymentStatusHistory(
                savedEmployee,
                null,
                status.name(),
                request.hireDate() != null ? request.hireDate() : LocalDate.now(),
                "Initial employee creation"
        );
        statusHistoryRepository.save(initialHistory);

        return toSummaryResponse(savedEmployee);
    }

    @Transactional
    public EmployeeSummaryResponse update(UUID id, UpdateEmployeeRequest request) {
        Employee employee = getEmployee(id);

        Branch branch = branchRepository.findByIdAndDeletedFalse(request.branchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch"));
        if (!branch.getCompany().getId().equals(employee.getCompany().getId())) {
            throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Branch does not belong to employee's company", HttpStatus.BAD_REQUEST);
        }

        String workEmail = StringUtils.hasText(request.workEmail()) ? request.workEmail().trim().toLowerCase() : null;
        if (workEmail != null && employeeRepository.existsByCompany_IdAndWorkEmailIgnoreCaseAndIdNotAndDeletedFalse(
                employee.getCompany().getId(), workEmail, employee.getId())) {
            throw new DomainException("EMPLOYEE_EMAIL_DUPLICATE", "Work email already exists for this company", HttpStatus.CONFLICT);
        }

        Department department = null;
        if (request.departmentId() != null) {
            department = departmentRepository.findByIdAndDeletedFalse(request.departmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department"));
        }

        Division division = null;
        if (request.divisionId() != null) {
            division = divisionRepository.findByIdAndDeletedFalse(request.divisionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Division"));
        }

        Position position = null;
        if (request.positionId() != null) {
            position = positionRepository.findByIdAndDeletedFalse(request.positionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Position"));
        }

        Grade grade = null;
        if (request.gradeId() != null) {
            grade = gradeRepository.findByIdAndDeletedFalse(request.gradeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grade"));
        }

        JobLevel jobLevel = null;
        if (request.jobLevelId() != null) {
            jobLevel = jobLevelRepository.findByIdAndDeletedFalse(request.jobLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("JobLevel"));
        }

        if (employee.getEmploymentStatus() == EmploymentStatus.ACTIVE) {
            if (department == null || position == null || request.hireDate() == null) {
                throw new DomainException("EMPLOYEE_INACTIVE_ASSIGNMENT", "Active employee requires department, position, and hire date", HttpStatus.BAD_REQUEST);
            }
        }

        employee.setBranch(branch);
        employee.setDepartment(department);
        employee.setDivision(division);
        employee.setPosition(position);
        employee.setGrade(grade);
        employee.setJobLevel(jobLevel);
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName() != null ? request.lastName().trim() : null);
        employee.setWorkEmail(workEmail);
        employee.setHireDate(request.hireDate());

        return toSummaryResponse(employee);
    }

    @Transactional
    public void delete(UUID id) {
        Employee employee = getEmployee(id);
        employee.setDeleted(true);
    }

    public Employee getEmployee(UUID id) {
        return employeeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee"));
    }

    public EmployeeSummaryResponse toSummaryResponse(Employee employee) {
        return new EmployeeSummaryResponse(
                employee.getId(),
                employee.getCompany().getId(),
                employee.getCompany().getName(),
                employee.getBranch().getId(),
                employee.getBranch().getName(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getDivision() != null ? employee.getDivision().getId() : null,
                employee.getDivision() != null ? employee.getDivision().getName() : null,
                employee.getPosition() != null ? employee.getPosition().getId() : null,
                employee.getPosition() != null ? employee.getPosition().getName() : null,
                employee.getGrade() != null ? employee.getGrade().getId() : null,
                employee.getGrade() != null ? employee.getGrade().getName() : null,
                employee.getJobLevel() != null ? employee.getJobLevel().getId() : null,
                employee.getJobLevel() != null ? employee.getJobLevel().getName() : null,
                employee.getEmployeeNumber(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getFullName(),
                employee.getWorkEmail(),
                employee.getEmploymentStatus(),
                employee.getHireDate(),
                employee.getTerminationDate(),
                employee.getCreatedAt(),
                employee.getUpdatedAt(),
                employee.getVersion()
        );
    }
}
