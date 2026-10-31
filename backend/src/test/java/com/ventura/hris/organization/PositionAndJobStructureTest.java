package com.ventura.hris.organization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.organization.dto.CreateDepartmentRequest;
import com.ventura.hris.organization.dto.CreateGradeRequest;
import com.ventura.hris.organization.dto.CreateJobLevelRequest;
import com.ventura.hris.organization.dto.CreatePositionRequest;
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

import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PositionAndJobStructureTest {

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
    void gradeAndJobLevelOrderingAndPositionConstraints_shouldSucceed() throws Exception {
        // 1. Create Grade 1
        CreateGradeRequest grade1 = new CreateGradeRequest(company.getId(), "G1", "Junior", 1, "ACTIVE");
        MvcResult gradeResult = mockMvc.perform(post("/api/v1/grades")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(grade1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code", is("G1")))
                .andExpect(jsonPath("$.data.sortOrder", is(1)))
                .andReturn();

        String gradeIdStr = objectMapper.readTree(gradeResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID gradeId = UUID.fromString(gradeIdStr);

        // 2. Reject duplicate sort order for Grade
        CreateGradeRequest duplicateSortGrade = new CreateGradeRequest(company.getId(), "G2", "Mid", 1, "ACTIVE");
        mockMvc.perform(post("/api/v1/grades")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateSortGrade)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("GRADE_SORT_ORDER_DUPLICATE")));

        // 3. Create JobLevel 1
        CreateJobLevelRequest level1 = new CreateJobLevelRequest(company.getId(), "L1", "Staff", 1, "ACTIVE");
        MvcResult levelResult = mockMvc.perform(post("/api/v1/job-levels")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(level1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code", is("L1")))
                .andExpect(jsonPath("$.data.sortOrder", is(1)))
                .andReturn();

        String levelIdStr = objectMapper.readTree(levelResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID levelId = UUID.fromString(levelIdStr);

        // 4. Reject duplicate sort order for JobLevel
        CreateJobLevelRequest duplicateSortLevel = new CreateJobLevelRequest(company.getId(), "L2", "Lead", 1, "ACTIVE");
        mockMvc.perform(post("/api/v1/job-levels")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateSortLevel)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("JOB_LEVEL_SORT_ORDER_DUPLICATE")));

        // 5. Create Department for Position
        CreateDepartmentRequest deptRequest = new CreateDepartmentRequest(
                company.getId(), "IT", "Information Technology", null, "ACTIVE", null
        );
        MvcResult deptResult = mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deptRequest)))
                .andExpect(status().isCreated())
                .andReturn();
        UUID deptId = UUID.fromString(objectMapper.readTree(deptResult.getResponse().getContentAsString()).path("data").path("id").asText());

        // 6. Create Position linked to Department, Grade, JobLevel
        CreatePositionRequest posRequest = new CreatePositionRequest(
                company.getId(),
                deptId,
                null,
                gradeId,
                levelId,
                "DEV-01",
                "Junior Software Engineer",
                "ACTIVE",
                null
        );

        MvcResult posResult = mockMvc.perform(post("/api/v1/positions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(posRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code", is("DEV-01")))
                .andExpect(jsonPath("$.data.departmentName", is("Information Technology")))
                .andExpect(jsonPath("$.data.gradeName", is("Junior")))
                .andExpect(jsonPath("$.data.jobLevelName", is("Staff")))
                .andReturn();

        UUID posId = UUID.fromString(objectMapper.readTree(posResult.getResponse().getContentAsString()).path("data").path("id").asText());

        // 7. Reject deleting Grade or JobLevel while assigned to Position
        mockMvc.perform(delete("/api/v1/grades/" + gradeId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("GRADE_IN_USE")));

        mockMvc.perform(delete("/api/v1/job-levels/" + levelId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("JOB_LEVEL_IN_USE")));

        // 8. Delete Position and then delete Grade & JobLevel
        mockMvc.perform(delete("/api/v1/positions/" + posId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/grades/" + gradeId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/job-levels/" + levelId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());
    }
}
