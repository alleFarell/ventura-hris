package com.ventura.hris.training;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.setup.entity.Branch;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.BranchRepository;
import com.ventura.hris.setup.repository.CompanyRepository;
import com.ventura.hris.training.dto.*;
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
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingAndCertificationsTest {

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
    private Employee employee1;
    private Employee employee2;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-TRN", "Training Co", "PT Training Ventura",
                "01.234.567.8-888.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-TRN", "HQ Branch", "Jl. Training 1", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        Department dept = new Department();
        dept.setCompany(company);
        dept.setCode("ENG");
        dept.setName("Engineering");
        dept = departmentRepository.save(dept);

        Position pos = new Position();
        pos.setCompany(company);
        pos.setDepartment(dept);
        pos.setCode("ENG-01");
        pos.setName("Engineer");
        pos = positionRepository.save(pos);

        employee1 = new Employee();
        employee1.setCompany(company);
        employee1.setBranch(branch);
        employee1.setDepartment(dept);
        employee1.setPosition(pos);
        employee1.setEmployeeNumber("EMP-TRN01");
        employee1.setFirstName("Alice");
        employee1.setLastName("Smith");
        employee1.setWorkEmail("alice.smith@training.com");
        employee1.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee1.setHireDate(LocalDate.of(2022, 1, 1));
        employee1 = employeeRepository.save(employee1);

        employee2 = new Employee();
        employee2.setCompany(company);
        employee2.setBranch(branch);
        employee2.setDepartment(dept);
        employee2.setPosition(pos);
        employee2.setEmployeeNumber("EMP-TRN02");
        employee2.setFirstName("Bob");
        employee2.setLastName("Jones");
        employee2.setWorkEmail("bob.jones@training.com");
        employee2.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee2.setHireDate(LocalDate.of(2023, 1, 1));
        employee2 = employeeRepository.save(employee2);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldCreateAndRetrieveTrainingCourse() throws Exception {
        TrainingCourseRequest req = new TrainingCourseRequest(
                company.getId(),
                "TRN-JAVA-01",
                "Advanced Spring Boot & Microservices",
                "TECHNICAL",
                "Tech Academy",
                BigDecimal.valueOf(16.0),
                BigDecimal.valueOf(2500000.0),
                true,
                "Comprehensive Spring Boot architectural training"
        );

        mockMvc.perform(post("/api/v1/training/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("TRN-JAVA-01"))
                .andExpect(jsonPath("$.data.title").value("Advanced Spring Boot & Microservices"));

        mockMvc.perform(get("/api/v1/training/courses")
                        .param("companyId", company.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].category").value("TECHNICAL"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldEnforceSessionCapacityAndPreventDuplicates() throws Exception {
        // 1. Create Course
        TrainingCourseRequest courseReq = new TrainingCourseRequest(
                company.getId(),
                "TRN-LEAD-01",
                "Executive Leadership 101",
                "LEADERSHIP",
                "Internal HR",
                BigDecimal.valueOf(8.0),
                BigDecimal.ZERO,
                true,
                "Leadership workshop"
        );
        String courseResp = mockMvc.perform(post("/api/v1/training/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID courseId = UUID.fromString(objectMapper.readTree(courseResp).path("data").path("id").asText());

        // 2. Create Session with capacity = 1
        Instant start = Instant.now().plus(2, ChronoUnit.DAYS);
        Instant end = start.plus(4, ChronoUnit.HOURS);
        TrainingSessionRequest sessionReq = new TrainingSessionRequest(
                courseId,
                "Cohort 1 - Limited",
                start,
                end,
                "Room 301 / Zoom",
                1, // capacity 1
                "SCHEDULED",
                "John Maxwell"
        );

        String sessionResp = mockMvc.perform(post("/api/v1/training/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID sessionId = UUID.fromString(objectMapper.readTree(sessionResp).path("data").path("id").asText());

        // 3. Enroll employee1 -> Success
        TrainingEnrollmentRequest enroll1 = new TrainingEnrollmentRequest(sessionId, employee1.getId(), "REQUESTED");
        String enroll1Resp = mockMvc.perform(post("/api/v1/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enroll1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("REQUESTED"))
                .andReturn().getResponse().getContentAsString();

        UUID enrollmentId = UUID.fromString(objectMapper.readTree(enroll1Resp).path("data").path("id").asText());

        // 4. Try to enroll employee1 again -> Duplicate error (400)
        mockMvc.perform(post("/api/v1/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enroll1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("ALREADY_ENROLLED"));

        // 5. Try to enroll employee2 -> Session Capacity error (400)
        TrainingEnrollmentRequest enroll2 = new TrainingEnrollmentRequest(sessionId, employee2.getId(), "REQUESTED");
        mockMvc.perform(post("/api/v1/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enroll2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("SESSION_CAPACITY_EXCEEDED"));

        // 6. Complete enrollment1 with score and certificate
        EnrollmentStatusUpdateRequest updateReq = new EnrollmentStatusUpdateRequest(
                "COMPLETED",
                BigDecimal.valueOf(95.5),
                "https://storage.ventura.com/certs/cert-trn01.pdf"
        );
        mockMvc.perform(put("/api/v1/training/enrollments/" + enrollmentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.score").value(95.5));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldManageEmployeeCertifications() throws Exception {
        // 1. Create Active Certification
        EmployeeCertificationRequest cert1 = new EmployeeCertificationRequest(
                employee1.getId(),
                "AWS Certified Solutions Architect",
                "Amazon Web Services",
                "AWS-772819",
                LocalDate.now().minusMonths(6),
                LocalDate.now().plusYears(2),
                "https://aws.amazon.com/verify/AWS-772819"
        );

        mockMvc.perform(post("/api/v1/training/certifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cert1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.certificationName").value("AWS Certified Solutions Architect"))
                .andExpect(jsonPath("$.data.isExpired").value(false));

        // 2. Create Expired Certification
        EmployeeCertificationRequest cert2 = new EmployeeCertificationRequest(
                employee1.getId(),
                "Oracle Certified Java Programmer",
                "Oracle",
                "OCJP-1029",
                LocalDate.now().minusYears(3),
                LocalDate.now().minusMonths(2),
                "https://oracle.com/verify/OCJP-1029"
        );

        String cert2Resp = mockMvc.perform(post("/api/v1/training/certifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cert2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isExpired").value(true))
                .andReturn().getResponse().getContentAsString();

        UUID cert2Id = UUID.fromString(objectMapper.readTree(cert2Resp).path("data").path("id").asText());

        // 3. Get certifications by employee
        mockMvc.perform(get("/api/v1/training/certifications")
                        .param("employeeId", employee1.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        // 4. Delete certification
        mockMvc.perform(delete("/api/v1/training/certifications/" + cert2Id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/training/certifications")
                        .param("employeeId", employee1.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }
}
