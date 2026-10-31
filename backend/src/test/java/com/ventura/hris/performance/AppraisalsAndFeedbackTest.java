package com.ventura.hris.performance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.performance.dto.*;
import com.ventura.hris.performance.entity.PerformanceCycle;
import com.ventura.hris.performance.repository.PerformanceCycleRepository;
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
class AppraisalsAndFeedbackTest {

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
    private EmployeeRepository employeeRepository;

    @Autowired
    private PerformanceCycleRepository cycleRepository;

    private Company company;
    private PerformanceCycle cycle;
    private Employee employee;
    private Employee manager;
    private Employee peer;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-APP1", "Appraisal Corp", "PT Appraisal Ventura",
                "01.234.567.8-777.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-APP1", "HQ Branch", "Jl. Sudirman 45", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        cycle = new PerformanceCycle();
        cycle.setCompany(company);
        cycle.setName("Annual Appraisal Cycle 2027");
        cycle.setCycleType("ANNUAL");
        cycle.setStartDate(LocalDate.of(2027, 1, 1));
        cycle.setEndDate(LocalDate.of(2027, 12, 31));
        cycle.setSelfReviewDeadline(LocalDate.of(2027, 11, 15));
        cycle.setManagerReviewDeadline(LocalDate.of(2027, 12, 1));
        cycle.setStatus("ACTIVE");
        cycle = cycleRepository.save(cycle);

        manager = new Employee();
        manager.setCompany(company);
        manager.setBranch(branch);
        manager.setEmployeeNumber("EMP-MGR-001");
        manager.setFirstName("Budi");
        manager.setLastName("Santoso");
        manager.setWorkEmail("budi.santoso@ventura.com");
        manager.setHireDate(LocalDate.of(2024, 1, 1));
        manager.setEmploymentStatus(EmploymentStatus.ACTIVE);
        manager = employeeRepository.save(manager);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-DEV-001");
        employee.setFirstName("Farhan");
        employee.setLastName("Ramadhan");
        employee.setWorkEmail("farhan.ramadhan@ventura.com");
        employee.setHireDate(LocalDate.of(2025, 2, 1));
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee = employeeRepository.save(employee);

        peer = new Employee();
        peer.setCompany(company);
        peer.setBranch(branch);
        peer.setEmployeeNumber("EMP-DEV-002");
        peer.setFirstName("Sarah");
        peer.setLastName("Nugroho");
        peer.setWorkEmail("sarah.nugroho@ventura.com");
        peer.setHireDate(LocalDate.of(2025, 3, 1));
        peer.setEmploymentStatus(EmploymentStatus.ACTIVE);
        peer = employeeRepository.save(peer);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldExecuteAppraisalWorkflowAnd360Feedback() throws Exception {
        // 1. Create Competency Model
        CompetencyModelRequest compRequest = new CompetencyModelRequest(
                company.getId(),
                "COMP-SYS-DESIGN",
                "Distributed System Architecture",
                "FUNCTIONAL",
                "Proficiency in microservices design, caching, and database scaling",
                25
        );

        mockMvc.perform(post("/api/v1/performance/competencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(compRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("COMP-SYS-DESIGN"))
                .andExpect(jsonPath("$.data.name").value("Distributed System Architecture"));

        // 2. Initiate Employee Appraisal
        EmployeeAppraisalRequest appRequest = new EmployeeAppraisalRequest(
                cycle.getId(),
                employee.getId(),
                manager.getId()
        );

        String appJson = mockMvc.perform(post("/api/v1/performance/appraisals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SELF_REVIEW"))
                .andExpect(jsonPath("$.data.employeeName").value("Farhan Ramadhan"))
                .andExpect(jsonPath("$.data.managerName").value("Budi Santoso"))
                .andReturn().getResponse().getContentAsString();

        EmployeeAppraisalResponse appResponse = objectMapper.readValue(
                objectMapper.readTree(appJson).get("data").toString(),
                EmployeeAppraisalResponse.class
        );

        // 3. Request 360 Feedback from Peer
        Feedback360Request fbRequest = new Feedback360Request(
                appResponse.id(),
                peer.getId(),
                "PEER",
                true
        );

        String fbJson = mockMvc.perform(post("/api/v1/performance/feedback/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fbRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("REQUESTED"))
                .andExpect(jsonPath("$.data.reviewerName").value("Anonymous PEER"))
                .andReturn().getResponse().getContentAsString();

        Feedback360Response fbResponse = objectMapper.readValue(
                objectMapper.readTree(fbJson).get("data").toString(),
                Feedback360Response.class
        );

        // 4. Peer Submits 360 Feedback
        Feedback360SubmitRequest fbSubmit = new Feedback360SubmitRequest(
                new BigDecimal("4.80"),
                "Exceptional collaboration and willingness to help other team members."
        );

        mockMvc.perform(post("/api/v1/performance/feedback/" + fbResponse.id() + "/respond")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fbSubmit)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.rating").value(4.80));

        // 5. Employee Submits Self-Review -> status becomes MANAGER_REVIEW
        AppraisalSelfReviewRequest selfReview = new AppraisalSelfReviewRequest(
                new BigDecimal("4.50"),
                "Exceeded all OKR targets and delivered critical core services ahead of schedule."
        );

        mockMvc.perform(put("/api/v1/performance/appraisals/" + appResponse.id() + "/submit-self")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(selfReview)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("MANAGER_REVIEW"))
                .andExpect(jsonPath("$.data.selfScore").value(4.50));

        // 6. Manager Submits Appraisal Review -> status becomes COMPLETED
        AppraisalManagerReviewRequest mgrReview = new AppraisalManagerReviewRequest(
                new BigDecimal("4.60"),
                "Outstanding execution, demonstrated technical leadership and stellar team mentorship."
        );

        // final score: 4.50 * 0.30 + 4.60 * 0.70 = 1.35 + 3.22 = 4.57 -> Grade "A"
        mockMvc.perform(put("/api/v1/performance/appraisals/" + appResponse.id() + "/submit-manager")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mgrReview)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.managerScore").value(4.60))
                .andExpect(jsonPath("$.data.finalScore").value(4.57))
                .andExpect(jsonPath("$.data.performanceGrade").value("A"));
    }
}
