package com.ventura.hris.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.dto.CreateDocumentRequest;
import com.ventura.hris.employee.dto.CreateEmergencyContactRequest;
import com.ventura.hris.employee.dto.CreateEmployeeRequest;
import com.ventura.hris.employee.dto.PersonalInformationRequest;
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
class EmployeeProfileAndSensitiveDataTest {

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

        Department dept = new Department(company, "HR", "Human Resources", null, "ACTIVE");
        dept = departmentRepository.save(dept);

        Position pos = new Position(company, dept, null, null, null, "HR-MGR", "HR Manager", "ACTIVE");
        pos = positionRepository.save(pos);

        CreateEmployeeRequest empRequest = new CreateEmployeeRequest(
                company.getId(),
                branch.getId(),
                dept.getId(),
                null,
                pos.getId(),
                null,
                null,
                "EMP-100",
                "Michael",
                "Scott",
                "mscott@ventura.test",
                "ACTIVE",
                LocalDate.of(2025, 1, 1)
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
    void personalInformationEmergencyContactsAndDocuments_shouldSucceed() throws Exception {
        // 1. Update Personal Information
        PersonalInformationRequest personalInfoRequest = new PersonalInformationRequest(
                LocalDate.of(1985, 3, 15),
                "Scranton",
                "MALE",
                "MARRIED",
                "Indonesian",
                "3171012345678901",
                "01.234.567.8-901.000",
                "mscott.personal@gmail.test",
                "+6281234567890",
                "Condo No. 42, Jakarta"
        );

        mockMvc.perform(put("/api/v1/employees/" + employeeId + "/personal-information")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(personalInfoRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.identityNumber", is("3171012345678901")))
                .andExpect(jsonPath("$.data.personalPhone", is("+6281234567890")));

        // Verify retrieval
        mockMvc.perform(get("/api/v1/employees/" + employeeId + "/personal-information")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.birthPlace", is("Scranton")));

        // 2. Add Emergency Contacts
        CreateEmergencyContactRequest contact1 = new CreateEmergencyContactRequest(
                "Holly Flax", "Spouse", "+6281987654321", "holly@ventura.test", true
        );
        MvcResult contactResult1 = mockMvc.perform(post("/api/v1/employees/" + employeeId + "/emergency-contacts")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contact1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name", is("Holly Flax")))
                .andExpect(jsonPath("$.data.primaryContact", is(true)))
                .andReturn();

        UUID contactId1 = UUID.fromString(objectMapper.readTree(contactResult1.getResponse().getContentAsString()).path("data").path("id").asText());

        // Add second contact as new primary contact
        CreateEmergencyContactRequest contact2 = new CreateEmergencyContactRequest(
                "Dwight Schrute", "Colleague", "+628111222333", "dwight@ventura.test", true
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/emergency-contacts")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contact2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name", is("Dwight Schrute")))
                .andExpect(jsonPath("$.data.primaryContact", is(true)));

        // List contacts: Dwight should be primary (first), Holly non-primary (second)
        mockMvc.perform(get("/api/v1/employees/" + employeeId + "/emergency-contacts")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].name", is("Dwight Schrute")))
                .andExpect(jsonPath("$.data[0].primaryContact", is(true)))
                .andExpect(jsonPath("$.data[1].name", is("Holly Flax")))
                .andExpect(jsonPath("$.data[1].primaryContact", is(false)));

        // Delete Holly's contact
        mockMvc.perform(delete("/api/v1/employees/" + employeeId + "/emergency-contacts/" + contactId1)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());

        // 3. Document Metadata
        CreateDocumentRequest docRequest = new CreateDocumentRequest(
                "Identity", "ktp_michael_scott.pdf", "/docs/2026/ktp.pdf",
                "RESTRICTED", "REGULATORY", LocalDate.of(2030, 1, 1), "ACTIVE"
        );
        mockMvc.perform(post("/api/v1/employees/" + employeeId + "/documents")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.documentType", is("Identity")))
                .andExpect(jsonPath("$.data.fileName", is("ktp_michael_scott.pdf")));

        mockMvc.perform(get("/api/v1/employees/" + employeeId + "/documents")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }
}
