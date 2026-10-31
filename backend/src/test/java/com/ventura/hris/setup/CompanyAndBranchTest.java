package com.ventura.hris.setup;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.security.dto.LoginRequest;
import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.repository.RefreshTokenRepository;
import com.ventura.hris.security.repository.RoleRepository;
import com.ventura.hris.security.repository.UserRepository;
import com.ventura.hris.setup.dto.CreateBranchRequest;
import com.ventura.hris.setup.dto.CreateCompanyRequest;
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
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompanyAndBranchTest {

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
    private com.ventura.hris.util.TestDatabaseCleaner databaseCleaner;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String authToken;

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
    }

    @Test
    void createAndListCompany_shouldSucceed() throws Exception {
        CreateCompanyRequest companyRequest = new CreateCompanyRequest(
                "COMP01",
                "Ventura Group",
                "PT Ventura Group Indonesia",
                "01.234.567.8-901.000",
                "id-ID",
                "Asia/Jakarta",
                "IDR",
                "YYYY-MM-DD",
                "ACTIVE"
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/companies")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(companyRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("COMP01")))
                .andExpect(jsonPath("$.data.name", is("Ventura Group")))
                .andReturn();

        String companyIdStr = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID companyId = UUID.fromString(companyIdStr);

        // List companies
        mockMvc.perform(get("/api/v1/companies")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)));

        // Create Branch for this Company
        CreateBranchRequest branchRequest = new CreateBranchRequest(
                companyId,
                "HQ-JKT",
                "Jakarta Headquarters",
                "Jl. Sudirman No. 1",
                "Level 15",
                "Jakarta Selatan",
                "DKI Jakarta",
                "12190",
                "ID",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/branches")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(branchRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("HQ-JKT")))
                .andExpect(jsonPath("$.data.name", is("Jakarta Headquarters")));

        // List Branches
        mockMvc.perform(get("/api/v1/branches")
                        .header("Authorization", "Bearer " + authToken)
                        .param("companyId", companyId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].code", is("HQ-JKT")));
    }

    @Test
    void unauthenticatedAccess_shouldBeRejected() throws Exception {
        mockMvc.perform(get("/api/v1/companies"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
