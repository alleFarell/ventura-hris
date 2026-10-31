package com.ventura.hris.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.dto.CreateEmployeeRequest;
import com.ventura.hris.employee.dto.UpdateEmployeeRequest;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.security.dto.LoginRequest;
import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.repository.RoleRepository;
import com.ventura.hris.security.repository.UserRepository;
import com.ventura.hris.setup.entity.Branch;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.BranchRepository;
import com.ventura.hris.setup.repository.CompanyRepository;
import com.ventura.hris.util.TestDatabaseCleaner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmployeeMasterAndAssignmentTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner databaseCleaner;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String authToken;
    private Company company;
    private Branch branch;
    private Department department;
    private Position position;

    @BeforeEach
    void setUp() throws Exception {
        databaseCleaner.clean();

        Role adminRole = roleRepository.save(new Role("ROLE_SUPER_ADMIN", "Super Admin", "All access"));
        User user = new User();
        user.setUsername("testadmin");
        user.setEmail("admin@ventura.test");
        user.setFullName("Test Administrator");
        user.setPasswordHash(passwordEncoder.encode("Password@123"));
        user.setStatus("ACTIVE");
        user.setRoles(Set.of(adminRole));
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest("testadmin", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        authToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        company = new Company(
                "COMP01", "Ventura Group", "PT Ventura Group Indonesia",
                "01.234.567.8-901.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "HQ-JKT", "Jakarta HQ", "Jl. Sudirman 1", null,
                "Jakarta Selatan", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        department = new Department(company, "ENG", "Engineering", "Tech team", "ACTIVE");
        department = departmentRepository.save(department);

        position = new Position(company, department, null, null, null, "SE", "Software Engineer", "ACTIVE");
        position = positionRepository.save(position);
    }

    @Test
    void employeeCreationValidationAndLifecycle_shouldSucceed() throws Exception {
        // 1. Create Candidate Employee (no dept/position required yet)
        CreateEmployeeRequest candidateRequest = new CreateEmployeeRequest(
                company.getId(),
                branch.getId(),
                null,
                null,
                null,
                null,
                null,
                "EMP-001",
                "Alice",
                "Smith",
                "alice.smith@ventura.test",
                "CANDIDATE",
                null
        );

        MvcResult candidateResult = mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candidateRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.employeeNumber", is("EMP-001")))
                .andExpect(jsonPath("$.data.employmentStatus", is("CANDIDATE")))
                .andReturn();

        String employeeIdStr = objectMapper.readTree(candidateResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID employeeId = UUID.fromString(employeeIdStr);

        // 2. Reject Duplicate Employee Number
        mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candidateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("EMPLOYEE_NUMBER_DUPLICATE")));

        // 3. Reject Active Employee creation when missing required assignment (dept/pos/hireDate)
        CreateEmployeeRequest invalidActiveRequest = new CreateEmployeeRequest(
                company.getId(),
                branch.getId(),
                null,
                null,
                null,
                null,
                null,
                "EMP-002",
                "Bob",
                "Jones",
                "bob@ventura.test",
                "ACTIVE",
                null
        );
        mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidActiveRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("EMPLOYEE_INACTIVE_ASSIGNMENT")));

        // 4. Update Candidate with department and position assignment
        UpdateEmployeeRequest updateRequest = new UpdateEmployeeRequest(
                branch.getId(),
                department.getId(),
                null,
                position.getId(),
                null,
                null,
                "Alice",
                "Johnson",
                "alice.johnson@ventura.test",
                LocalDate.of(2026, 10, 1)
        );

        mockMvc.perform(put("/api/v1/employees/" + employeeId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lastName", is("Johnson")))
                .andExpect(jsonPath("$.data.departmentName", is("Engineering")))
                .andExpect(jsonPath("$.data.positionName", is("Software Engineer")));

        // 5. Search / List Employees
        mockMvc.perform(get("/api/v1/employees")
                        .header("Authorization", "Bearer " + authToken)
                        .param("companyId", company.getId().toString())
                        .param("search", "Alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].employeeNumber", is("EMP-001")));

        // 6. Soft Delete Employee
        mockMvc.perform(delete("/api/v1/employees/" + employeeId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Verify no active employees found
        mockMvc.perform(get("/api/v1/employees")
                        .header("Authorization", "Bearer " + authToken)
                        .param("companyId", company.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
