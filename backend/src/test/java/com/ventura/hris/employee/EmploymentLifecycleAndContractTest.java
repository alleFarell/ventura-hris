package com.ventura.hris.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.dto.ChangeStatusRequest;
import com.ventura.hris.employee.dto.CreateContractRequest;
import com.ventura.hris.employee.dto.CreateEmployeeRequest;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmploymentLifecycleAndContractTest {

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
    private UUID employeeId;

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

        Company company = new Company(
                "COMP01", "Ventura Group", "PT Ventura Group Indonesia",
                "01.234.567.8-901.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "HQ-JKT", "Jakarta HQ", "Jl. Sudirman 1", null,
                "Jakarta Selatan", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        Department dept = new Department(company, "OPS", "Operations", null, "ACTIVE");
        dept = departmentRepository.save(dept);

        Position pos = new Position(company, dept, null, null, null, "OPS-LEAD", "Operations Lead", "ACTIVE");
        pos = positionRepository.save(pos);

        CreateEmployeeRequest empRequest = new CreateEmployeeRequest(
                company.getId(),
                branch.getId(),
                dept.getId(),
                null,
                pos.getId(),
                null,
                null,
                "EMP-200",
                "Pam",
                "Beesly",
                "pbeesly@ventura.test",
                "CANDIDATE",
                LocalDate.of(2026, 1, 1)
        );

        MvcResult empResult = mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(empRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        employeeId = UUID.fromString(objectMapper.readTree(empResult.getResponse().getContentAsString()).path("data").path("id").asText());
    }

    @Test
    void statusTransitionsAndContractOverlapValidation_shouldSucceed() throws Exception {
        // 1. Candidate -> Probation
        ChangeStatusRequest toProbation = new ChangeStatusRequest(
                "PROBATION", LocalDate.of(2026, 1, 15), "Passed initial interview"
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/status-changes")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toProbation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.oldStatus", is("CANDIDATE")))
                .andExpect(jsonPath("$.data.newStatus", is("PROBATION")));

        // 2. Probation -> Active
        ChangeStatusRequest toActive = new ChangeStatusRequest(
                "ACTIVE", LocalDate.of(2026, 4, 15), "Passed probation successfully"
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/status-changes")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toActive)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.oldStatus", is("PROBATION")))
                .andExpect(jsonPath("$.data.newStatus", is("ACTIVE")));

        // 3. Active -> Terminated
        ChangeStatusRequest toTerminated = new ChangeStatusRequest(
                "TERMINATED", LocalDate.of(2026, 10, 1), "Resignation"
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/status-changes")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toTerminated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.oldStatus", is("ACTIVE")))
                .andExpect(jsonPath("$.data.newStatus", is("TERMINATED")));

        // 4. Reject Transition from TERMINATED
        ChangeStatusRequest invalidAfterTerminated = new ChangeStatusRequest(
                "ACTIVE", LocalDate.of(2026, 10, 5), "Rehire attempt"
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/status-changes")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidAfterTerminated)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("EMPLOYEE_STATUS_TRANSITION_INVALID")));

        // 5. Verify Status History has 4 records (initial + 3 changes)
        mockMvc.perform(get("/api/v1/employees/" + employeeId + "/status-history")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(4)));

        // 6. Contracts: Create Contract 1 (2026-01-01 to 2026-12-31)
        CreateContractRequest contract1 = new CreateContractRequest(
                "FIXED_TERM", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31), "ACTIVE", null
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/contracts")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contract1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.contractType", is("FIXED_TERM")));

        // 7. Reject Overlapping Contract (e.g. 2026-06-01 to 2027-05-31)
        CreateContractRequest overlappingContract = new CreateContractRequest(
                "PERMANENT", LocalDate.of(2026, 6, 1), null, "ACTIVE", null
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/contracts")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overlappingContract)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("EMPLOYEE_CONTRACT_DATE_OVERLAP")));
    }
}
