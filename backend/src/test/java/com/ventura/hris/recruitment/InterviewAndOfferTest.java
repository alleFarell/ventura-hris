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
import com.ventura.hris.recruitment.entity.JobApplication;
import com.ventura.hris.recruitment.entity.JobCandidate;
import com.ventura.hris.recruitment.entity.JobPosting;
import com.ventura.hris.recruitment.entity.JobRequisition;
import com.ventura.hris.recruitment.repository.JobApplicationRepository;
import com.ventura.hris.recruitment.repository.JobCandidateRepository;
import com.ventura.hris.recruitment.repository.JobPostingRepository;
import com.ventura.hris.recruitment.repository.JobRequisitionRepository;
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
import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InterviewAndOfferTest {

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

    @Autowired
    private JobRequisitionRepository requisitionRepository;

    @Autowired
    private JobPostingRepository postingRepository;

    @Autowired
    private JobCandidateRepository candidateRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    private Employee interviewer;
    private JobApplication application;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        Company company = new Company(
                "CMP-INT1", "Interview Co", "PT Interview Ventura",
                "01.234.567.8-555.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-INT1", "HQ Branch", "Jl. Sudirman 45", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        Department department = new Department();
        department.setCompany(company);
        department.setCode("IT");
        department.setName("Information Technology");
        department = departmentRepository.save(department);

        Position position = new Position();
        position.setCompany(company);
        position.setDepartment(department);
        position.setCode("POS-ARCH");
        position.setName("Lead Architect");
        position = positionRepository.save(position);

        interviewer = new Employee();
        interviewer.setCompany(company);
        interviewer.setBranch(branch);
        interviewer.setEmployeeNumber("EMP-INT-001");
        interviewer.setFirstName("Rian");
        interviewer.setLastName("Hidayat");
        interviewer.setWorkEmail("rian.hidayat@ventura.com");
        interviewer.setHireDate(LocalDate.of(2024, 1, 1));
        interviewer.setEmploymentStatus(EmploymentStatus.ACTIVE);
        interviewer = employeeRepository.save(interviewer);

        JobRequisition requisition = new JobRequisition();
        requisition.setTitle("Lead Cloud Architect");
        requisition.setDepartment(department);
        requisition.setPosition(position);
        requisition.setHeadcount(1);
        requisition.setEmploymentType("PERMANENT");
        requisition.setMinSalary(new BigDecimal("25000000"));
        requisition.setMaxSalary(new BigDecimal("35000000"));
        requisition.setStatus("APPROVED");
        requisition.setRequisitionNumber("REQ-ARCH-001");
        requisition = requisitionRepository.save(requisition);

        JobPosting posting = new JobPosting();
        posting.setRequisition(requisition);
        posting.setPostingTitle("Lead Cloud Architect");
        posting.setDescription("Responsible for cloud infrastructure");
        posting.setRequirements("AWS / Kubernetes / Java");
        posting.setLocation("Jakarta");
        posting.setIsPublished(true);
        posting = postingRepository.save(posting);

        JobCandidate candidate = new JobCandidate();
        candidate.setFullName("Ahmad Syarif");
        candidate.setEmail("ahmad.syarif@cloud.org");
        candidate.setPhone("+62811223344");
        candidate.setCandidateNumber("CAN-ARCH-001");
        candidate = candidateRepository.save(candidate);

        application = new JobApplication();
        application.setJobPosting(posting);
        application.setCandidate(candidate);
        application.setApplicationDate(LocalDate.now());
        application.setCurrentStage("SCREENING");
        application.setApplicationNumber("APP-ARCH-001");
        application = applicationRepository.save(application);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldExecuteInterviewAndOfferLifecycle() throws Exception {
        // 1. Schedule Technical Interview
        InterviewScheduleRequest scheduleRequest = new InterviewScheduleRequest(
                application.getId(),
                "Technical System Design Round",
                Instant.now().plusSeconds(86400),
                90,
                interviewer.getId(),
                "https://meet.google.com/xyz-int-test",
                "Deep dive on distributed systems & AWS"
        );

        String scheduleJson = mockMvc.perform(post("/api/v1/recruitment/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.data.roundName").value("Technical System Design Round"))
                .andExpect(jsonPath("$.data.interviewerName").value("Rian Hidayat"))
                .andReturn().getResponse().getContentAsString();

        InterviewScheduleResponse scheduleResponse = objectMapper.readValue(
                objectMapper.readTree(scheduleJson).get("data").toString(),
                InterviewScheduleResponse.class
        );

        // 2. Submit Interview Evaluation
        InterviewEvaluationRequest evalRequest = new InterviewEvaluationRequest(
                interviewer.getId(),
                5,
                "RECOMMENDED",
                "Exceptional architecture expertise, clear communication, highly recommended for hire."
        );

        mockMvc.perform(post("/api/v1/recruitment/interviews/" + scheduleResponse.id() + "/evaluations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evalRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score").value(5))
                .andExpect(jsonPath("$.data.verdict").value("RECOMMENDED"));

        // Verify Interview is now COMPLETED
        mockMvc.perform(get("/api/v1/recruitment/interviews/" + scheduleResponse.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // 3. Create Job Offer
        JobOfferRequest offerRequest = new JobOfferRequest(
                application.getId(),
                new BigDecimal("30000000.00"),
                new BigDecimal("3500000.00"),
                LocalDate.now().plusWeeks(3),
                LocalDate.now().plusDays(7),
                "https://storage.ventura.com/letters/offer-ahmad.pdf",
                "Full-time Lead Architect position with stock options."
        );

        String offerJson = mockMvc.perform(post("/api/v1/recruitment/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.offerNumber", startsWith("OFF-")))
                .andExpect(jsonPath("$.data.offeredSalary").value(30000000.00))
                .andReturn().getResponse().getContentAsString();

        JobOfferResponse offerResponse = objectMapper.readValue(
                objectMapper.readTree(offerJson).get("data").toString(),
                JobOfferResponse.class
        );

        // 4. Update Offer Status to SENT
        mockMvc.perform(patch("/api/v1/recruitment/offers/" + offerResponse.id() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobOfferStatusUpdateRequest("SENT", "Offer letter sent to candidate email."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SENT"));

        // 5. Update Offer Status to ACCEPTED (which should promote application to HIRED)
        mockMvc.perform(patch("/api/v1/recruitment/offers/" + offerResponse.id() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobOfferStatusUpdateRequest("ACCEPTED", "Candidate signed and accepted the offer."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        // Verify application stage is now HIRED
        mockMvc.perform(get("/api/v1/recruitment/applications/" + application.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStage").value("HIRED"))
                .andExpect(jsonPath("$.data.rating").value(5));

        // 6. List Offers
        mockMvc.perform(get("/api/v1/recruitment/offers")
                        .param("status", "ACCEPTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].candidateName").value("Ahmad Syarif"));
    }
}
