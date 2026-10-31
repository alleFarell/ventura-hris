package com.ventura.hris.recruitment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.recruitment.dto.*;
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

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecruitmentAndAtsTest {

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
    private Department department;
    private Position position;
    private Employee employee;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-REC1", "Recruitment Co", "PT Recruitment Ventura",
                "01.234.567.8-444.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-REC1", "HQ Branch", "Jl. Sudirman 45", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        department = new Department();
        department.setCompany(company);
        department.setCode("ENG");
        department.setName("Engineering Department");
        department = departmentRepository.save(department);

        position = new Position();
        position.setCompany(company);
        position.setDepartment(department);
        position.setCode("POS-SWE");
        position.setName("Senior Software Engineer");
        position = positionRepository.save(position);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-HR-001");
        employee.setFirstName("Dewi");
        employee.setLastName("Sartika");
        employee.setWorkEmail("dewi.sartika@ventura.com");
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee = employeeRepository.save(employee);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldExecuteFullRecruitmentPipeline() throws Exception {
        // 1. Create Requisition
        JobRequisitionRequest reqRequest = new JobRequisitionRequest(
                "Senior Backend Engineer - Spring Boot",
                department.getId(),
                position.getId(),
                2,
                "PERMANENT",
                new BigDecimal("15000000.00"),
                new BigDecimal("22000000.00"),
                "Expanding backend core services",
                employee.getId()
        );

        String reqJson = mockMvc.perform(post("/api/v1/recruitment/requisitions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.requisitionNumber", startsWith("REQ-")))
                .andReturn().getResponse().getContentAsString();

        JobRequisitionResponse reqResponse = objectMapper.readValue(
                objectMapper.readTree(reqJson).get("data").toString(),
                JobRequisitionResponse.class
        );

        // 2. Submit Requisition
        mockMvc.perform(put("/api/v1/recruitment/requisitions/" + reqResponse.id() + "/submit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_APPROVAL"));

        // 3. Approve Requisition
        mockMvc.perform(put("/api/v1/recruitment/requisitions/" + reqResponse.id() + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 4. Create Job Posting
        JobPostingRequest postRequest = new JobPostingRequest(
                reqResponse.id(),
                "Senior Backend Java / Spring Boot Developer",
                "We are hiring a Senior Java Developer to architect high-throughput HR services.",
                "Minimum 5 years Java/Spring Boot experience, PostgreSQL, Docker.",
                "Jakarta (Hybrid)",
                true,
                LocalDate.now().plusMonths(1)
        );

        String postJson = mockMvc.perform(post("/api/v1/recruitment/postings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isPublished").value(true))
                .andReturn().getResponse().getContentAsString();

        JobPostingResponse postResponse = objectMapper.readValue(
                objectMapper.readTree(postJson).get("data").toString(),
                JobPostingResponse.class
        );

        // 5. Register Candidate
        JobCandidateRequest candRequest = new JobCandidateRequest(
                "Bayu Pratama",
                "bayu.pratama@techmail.com",
                "+628123456789",
                "https://storage.ventura.com/resumes/bayu-resume.pdf",
                "https://linkedin.com/in/bayupratama",
                "https://github.com/bayupratama"
        );

        String candJson = mockMvc.perform(post("/api/v1/recruitment/candidates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.candidateNumber", startsWith("CAN-")))
                .andExpect(jsonPath("$.data.fullName").value("Bayu Pratama"))
                .andReturn().getResponse().getContentAsString();

        JobCandidateResponse candResponse = objectMapper.readValue(
                objectMapper.readTree(candJson).get("data").toString(),
                JobCandidateResponse.class
        );

        // 6. Submit Job Application
        JobApplicationRequest appRequest = new JobApplicationRequest(
                postResponse.id(),
                candResponse.id(),
                LocalDate.now(),
                "Candidate referred via LinkedIn recruiter"
        );

        String appJson = mockMvc.perform(post("/api/v1/recruitment/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.currentStage").value("APPLIED"))
                .andExpect(jsonPath("$.data.applicationNumber", startsWith("APP-")))
                .andReturn().getResponse().getContentAsString();

        JobApplicationResponse appResponse = objectMapper.readValue(
                objectMapper.readTree(appJson).get("data").toString(),
                JobApplicationResponse.class
        );

        // 7. Prevent Duplicate Application
        mockMvc.perform(post("/api/v1/recruitment/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 8. Move Application through Pipeline Stages
        JobApplicationStageUpdateRequest stageUpdate = new JobApplicationStageUpdateRequest(
                "INTERVIEW",
                4,
                "Strong technical assessment and system design answers."
        );

        mockMvc.perform(put("/api/v1/recruitment/applications/" + appResponse.id() + "/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stageUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStage").value("INTERVIEW"))
                .andExpect(jsonPath("$.data.rating").value(4));
    }
}
