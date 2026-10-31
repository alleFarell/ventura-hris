package com.ventura.hris.organization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.organization.dto.CreateDepartmentRequest;
import com.ventura.hris.organization.dto.CreateDivisionRequest;
import com.ventura.hris.organization.dto.UpdateDepartmentRequest;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.DivisionRepository;
import com.ventura.hris.organization.repository.OrganizationStructureHistoryRepository;
import com.ventura.hris.organization.repository.OrganizationUnitRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.security.dto.LoginRequest;
import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.repository.RefreshTokenRepository;
import com.ventura.hris.security.repository.RoleRepository;
import com.ventura.hris.security.repository.UserRepository;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.BranchRepository;
import com.ventura.hris.setup.repository.CompanyRepository;
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
class DepartmentAndDivisionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DivisionRepository divisionRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private OrganizationUnitRepository organizationUnitRepository;

    @Autowired
    private OrganizationStructureHistoryRepository historyRepository;

    @Autowired
    private com.ventura.hris.util.TestDatabaseCleaner databaseCleaner;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String authToken;
    private Company company;

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
    }

    @Test
    void departmentAndDivisionLifecycle_shouldSucceed() throws Exception {
        // 1. Create Department
        CreateDepartmentRequest deptRequest = new CreateDepartmentRequest(
                company.getId(),
                "ENG",
                "Engineering",
                "Software engineering and IT",
                "ACTIVE",
                null
        );

        MvcResult deptResult = mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deptRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("ENG")))
                .andExpect(jsonPath("$.data.name", is("Engineering")))
                .andReturn();

        String deptIdStr = objectMapper.readTree(deptResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID deptId = UUID.fromString(deptIdStr);

        // 2. Reject Duplicate Department Code
        mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deptRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("DEPARTMENT_CODE_DUPLICATE")));

        // 3. Update Department
        UpdateDepartmentRequest updateRequest = new UpdateDepartmentRequest(
                "Engineering & Architecture",
                "Updated description",
                "ACTIVE"
        );
        mockMvc.perform(put("/api/v1/departments/" + deptId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Engineering & Architecture")));

        // 4. Create Division under Department
        CreateDivisionRequest divRequest = new CreateDivisionRequest(
                company.getId(),
                deptId,
                "BE",
                "Backend Engineering",
                "ACTIVE",
                null
        );

        MvcResult divResult = mockMvc.perform(post("/api/v1/divisions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(divRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("BE")))
                .andExpect(jsonPath("$.data.departmentName", is("Engineering & Architecture")))
                .andReturn();

        String divIdStr = objectMapper.readTree(divResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID divId = UUID.fromString(divIdStr);

        // 5. Deleting Department with existing Division must fail
        mockMvc.perform(delete("/api/v1/departments/" + deptId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("DEPT_HAS_DIVISIONS")));

        // 6. Delete Division first, then delete Department
        mockMvc.perform(delete("/api/v1/divisions/" + divId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        mockMvc.perform(delete("/api/v1/departments/" + deptId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 7. Verify Department list is empty
        mockMvc.perform(get("/api/v1/departments")
                        .header("Authorization", "Bearer " + authToken)
                        .param("companyId", company.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
