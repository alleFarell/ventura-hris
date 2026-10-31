package com.ventura.hris.offboarding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.offboarding.dto.ChecklistClearRequest;
import com.ventura.hris.offboarding.dto.ExitInterviewRequest;
import com.ventura.hris.offboarding.dto.OffboardingCaseRequest;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.PositionRepository;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OffboardingAndClearanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Company company;
    private Employee employee;
    private Employee hrInterviewer;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-OFF", "Offboarding Co", "PT Offboarding Ventura",
                "01.234.567.8-777.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-OFF", "HQ Offboarding", "Jl. Offboarding 1", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        Department dept = new Department();
        dept.setCompany(company);
        dept.setCode("OPS");
        dept.setName("Operations");
        dept = departmentRepository.save(dept);

        Position pos = new Position();
        pos.setCompany(company);
        pos.setDepartment(dept);
        pos.setCode("OPS-01");
        pos.setName("Operations Officer");
        pos = positionRepository.save(pos);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setDepartment(dept);
        employee.setPosition(pos);
        employee.setEmployeeNumber("EMP-OFF01");
        employee.setFirstName("Edward");
        employee.setLastName("Norton");
        employee.setWorkEmail("edward.norton@ventura.com");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2022, 1, 1));
        employee = employeeRepository.save(employee);

        hrInterviewer = new Employee();
        hrInterviewer.setCompany(company);
        hrInterviewer.setBranch(branch);
        hrInterviewer.setDepartment(dept);
        hrInterviewer.setPosition(pos);
        hrInterviewer.setEmployeeNumber("EMP-HR01");
        hrInterviewer.setFirstName("Sarah");
        hrInterviewer.setLastName("Connor");
        hrInterviewer.setWorkEmail("sarah.connor@ventura.com");
        hrInterviewer.setEmploymentStatus(EmploymentStatus.ACTIVE);
        hrInterviewer.setHireDate(LocalDate.of(2021, 6, 1));
        hrInterviewer = employeeRepository.save(hrInterviewer);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldAutoSeedChecklistsAndTerminateEmployeeUponFullClearance() throws Exception {
        // 1. Create Offboarding Case (AC-01)
        OffboardingCaseRequest req = new OffboardingCaseRequest(
                employee.getId(),
                "RESIGNATION",
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                "Pursuing higher education abroad"
        );

        String caseResp = mockMvc.perform(post("/api/v1/offboarding/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("IN_CLEARANCE"))
                .andExpect(jsonPath("$.data.totalItemsCount").value(8))
                .andExpect(jsonPath("$.data.clearedItemsCount").value(0))
                .andReturn().getResponse().getContentAsString();

        UUID caseId = UUID.fromString(objectMapper.readTree(caseResp).path("data").path("id").asText());

        // 2. Verify auto-seeded checklist items
        String listResp = mockMvc.perform(get("/api/v1/offboarding/checklists/" + caseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(8)))
                .andReturn().getResponse().getContentAsString();

        JsonNode itemsArray = objectMapper.readTree(listResp).path("data");

        // 3. Clear all items sequentially (AC-02)
        for (JsonNode item : itemsArray) {
            UUID itemId = UUID.fromString(item.path("id").asText());
            ChecklistClearRequest clearReq = new ChecklistClearRequest(
                    "hr.admin@ventura.com",
                    "Cleared item verification"
            );

            mockMvc.perform(put("/api/v1/offboarding/checklists/" + itemId + "/clear")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(clearReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.isCleared").value(true));
        }

        // 4. Verify case status is now COMPLETED
        mockMvc.perform(get("/api/v1/offboarding/cases/" + caseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.clearedItemsCount").value(8));

        // 5. Verify employee master status is now TERMINATED (AC-02)
        Employee updatedEmployee = employeeRepository.findById(employee.getId()).orElseThrow();
        assertThat(updatedEmployee.getEmploymentStatus()).isEqualTo(EmploymentStatus.TERMINATED);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldRecordAndRetrieveExitInterview() throws Exception {
        // 1. Create Offboarding Case
        OffboardingCaseRequest req = new OffboardingCaseRequest(
                employee.getId(),
                "RESIGNATION",
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                "Career pivot to AI engineering"
        );

        String caseResp = mockMvc.perform(post("/api/v1/offboarding/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID caseId = UUID.fromString(objectMapper.readTree(caseResp).path("data").path("id").asText());

        // 2. Submit Exit Interview
        ExitInterviewRequest interviewReq = new ExitInterviewRequest(
                caseId,
                hrInterviewer.getId(),
                "BETTER_OPPORTUNITY",
                5,
                4,
                "Exceptional leadership and supportive team culture. Leaving solely for graduate school."
        );

        mockMvc.perform(post("/api/v1/offboarding/exit-interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interviewReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.primaryReason").value("BETTER_OPPORTUNITY"))
                .andExpect(jsonPath("$.data.cultureRating").value(5))
                .andExpect(jsonPath("$.data.managementRating").value(4));

        // 3. Retrieve Exit Interview by case ID
        mockMvc.perform(get("/api/v1/offboarding/exit-interviews/" + caseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.caseId").value(caseId.toString()))
                .andExpect(jsonPath("$.data.interviewerName").value("Sarah Connor"));

        // 4. Duplicate Exit Interview returns 400
        mockMvc.perform(post("/api/v1/offboarding/exit-interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interviewReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INTERVIEW_ALREADY_EXISTS"));
    }
}
