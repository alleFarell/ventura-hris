package com.ventura.hris.organization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.organization.dto.CreateDepartmentRequest;
import com.ventura.hris.organization.dto.CreatePositionRequest;
import com.ventura.hris.organization.dto.MoveOrganizationUnitRequest;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.DivisionRepository;
import com.ventura.hris.organization.repository.GradeRepository;
import com.ventura.hris.organization.repository.JobLevelRepository;
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

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrganizationHierarchyTest {

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
    private GradeRepository gradeRepository;

    @Autowired
    private JobLevelRepository jobLevelRepository;

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
    void organizationHierarchy_TreeCycleDetectionAndHistory_shouldSucceed() throws Exception {
        // 1. Create Root Department "CORP"
        CreateDepartmentRequest corpDept = new CreateDepartmentRequest(
                company.getId(), "CORP", "Corporate Management", null, "ACTIVE", null
        );
        mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corpDept)))
                .andExpect(status().isCreated());

        UUID corpUnitId = organizationUnitRepository.findAllActiveByCompanyId(company.getId()).stream()
                .filter(u -> u.getCode().equals("CORP"))
                .findFirst().orElseThrow().getId();

        // 2. Create Child Department "FIN" under CORP
        CreateDepartmentRequest finDept = new CreateDepartmentRequest(
                company.getId(), "FIN", "Finance & Accounting", null, "ACTIVE", corpUnitId
        );
        mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(finDept)))
                .andExpect(status().isCreated());

        UUID finUnitId = organizationUnitRepository.findAllActiveByCompanyId(company.getId()).stream()
                .filter(u -> u.getCode().equals("FIN"))
                .findFirst().orElseThrow().getId();

        // 3. Create Position "CFO" under FIN
        CreatePositionRequest cfoPos = new CreatePositionRequest(
                company.getId(), null, null, null, null, "CFO", "Chief Financial Officer", "ACTIVE", finUnitId
        );
        mockMvc.perform(post("/api/v1/positions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cfoPos)))
                .andExpect(status().isCreated());

        UUID cfoUnitId = organizationUnitRepository.findAllActiveByCompanyId(company.getId()).stream()
                .filter(u -> u.getCode().equals("CFO"))
                .findFirst().orElseThrow().getId();

        // 4. Retrieve Tree View
        mockMvc.perform(get("/api/v1/organization-units/tree")
                        .header("Authorization", "Bearer " + authToken)
                        .param("companyId", company.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].code", is("CORP")))
                .andExpect(jsonPath("$.data[0].children", hasSize(1)))
                .andExpect(jsonPath("$.data[0].children[0].code", is("FIN")))
                .andExpect(jsonPath("$.data[0].children[0].children", hasSize(1)))
                .andExpect(jsonPath("$.data[0].children[0].children[0].code", is("CFO")));

        // 5. Test Cycle Detection: Attempt moving CORP under CFO (its descendant)
        MoveOrganizationUnitRequest cycleRequest = new MoveOrganizationUnitRequest(
                cfoUnitId, LocalDate.now(), "Testing cycle prevention"
        );
        mockMvc.perform(put("/api/v1/organization-units/" + corpUnitId + "/parent")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cycleRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("ORG_HIERARCHY_CYCLE")));

        // 6. Test Self-Parenting Cycle: Attempt moving CORP under CORP
        MoveOrganizationUnitRequest selfCycleRequest = new MoveOrganizationUnitRequest(
                corpUnitId, LocalDate.now(), "Testing self cycle"
        );
        mockMvc.perform(put("/api/v1/organization-units/" + corpUnitId + "/parent")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(selfCycleRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("ORG_HIERARCHY_CYCLE")));

        // 7. Legitimate Move: Move CFO directly under CORP
        MoveOrganizationUnitRequest validMoveRequest = new MoveOrganizationUnitRequest(
                corpUnitId, LocalDate.now(), "Executive Restructuring"
        );
        mockMvc.perform(put("/api/v1/organization-units/" + cfoUnitId + "/parent")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validMoveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.parentUnitId", is(corpUnitId.toString())));

        // 8. Verify Structure History Audit Log
        mockMvc.perform(get("/api/v1/organization-units/" + cfoUnitId + "/history")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].oldParentUnitId", is(finUnitId.toString())))
                .andExpect(jsonPath("$.data[0].newParentUnitId", is(corpUnitId.toString())))
                .andExpect(jsonPath("$.data[0].reason", is("Executive Restructuring")));
    }
}
