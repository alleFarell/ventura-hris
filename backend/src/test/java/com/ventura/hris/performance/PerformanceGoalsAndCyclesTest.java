package com.ventura.hris.performance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.performance.dto.*;
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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PerformanceGoalsAndCyclesTest {

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

    private Company company;
    private Employee employee;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-PERF1", "Performance Corp", "PT Performance Ventura",
                "01.234.567.8-666.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-PERF1", "HQ Branch", "Jl. Sudirman 45", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-PRF-001");
        employee.setFirstName("Rizky");
        employee.setLastName("Saputra");
        employee.setWorkEmail("rizky.saputra@ventura.com");
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee = employeeRepository.save(employee);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldManagePerformanceCyclesAndGoals() throws Exception {
        // 1. Create Performance Cycle
        PerformanceCycleRequest cycleRequest = new PerformanceCycleRequest(
                company.getId(),
                "Annual Review Cycle 2027",
                "ANNUAL",
                LocalDate.of(2027, 1, 1),
                LocalDate.of(2027, 12, 31),
                LocalDate.of(2027, 11, 15),
                LocalDate.of(2027, 12, 1)
        );

        String cycleJson = mockMvc.perform(post("/api/v1/performance/cycles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cycleRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Annual Review Cycle 2027"))
                .andExpect(jsonPath("$.data.status").value("PLANNED"))
                .andReturn().getResponse().getContentAsString();

        PerformanceCycleResponse cycleResponse = objectMapper.readValue(
                objectMapper.readTree(cycleJson).get("data").toString(),
                PerformanceCycleResponse.class
        );

        // 2. Activate Cycle
        mockMvc.perform(patch("/api/v1/performance/cycles/" + cycleResponse.id() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PerformanceCycleStatusUpdateRequest("ACTIVE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        // 3. Create Goal with Key Results
        PerformanceGoalKeyResultDto kr1 = new PerformanceGoalKeyResultDto(
                null,
                "Deliver 10 core microservice modules",
                "NUMBER",
                new BigDecimal("10.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "Target is 10 services deployed"
        );

        PerformanceGoalKeyResultDto kr2 = new PerformanceGoalKeyResultDto(
                null,
                "Maintain test coverage above 90%",
                "PERCENTAGE",
                new BigDecimal("100.00"),
                new BigDecimal("50.00"),
                BigDecimal.ZERO,
                "Current coverage 50%"
        );

        PerformanceGoalRequest goalRequest = new PerformanceGoalRequest(
                cycleResponse.id(),
                employee.getId(),
                "Core Platform Modernization & Architecture",
                "Migrate legacy modules to reactive microservices with high test coverage.",
                "INDIVIDUAL",
                100,
                List.of(kr1, kr2)
        );

        String goalJson = mockMvc.perform(post("/api/v1/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goalRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.progressPercent").value(25.00))
                .andExpect(jsonPath("$.data.keyResults", hasSize(2)))
                .andReturn().getResponse().getContentAsString();

        PerformanceGoalResponse goalResponse = objectMapper.readValue(
                objectMapper.readTree(goalJson).get("data").toString(),
                PerformanceGoalResponse.class
        );

        var kr1Id = goalResponse.keyResults().get(0).id();
        var kr2Id = goalResponse.keyResults().get(1).id();

        // 4. Update KR1 Progress (to 10 / 10 = 100%)
        KeyResultProgressUpdateRequest kr1Update = new KeyResultProgressUpdateRequest(
                new BigDecimal("10.00"),
                "Completed all 10 microservices."
        );

        mockMvc.perform(put("/api/v1/performance/goals/" + goalResponse.id() + "/key-results/" + kr1Id + "/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(kr1Update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progressPercent").value(75.00));

        // 5. Update KR2 Progress (to 100 / 100 = 100%) -> Goal status should become COMPLETED
        KeyResultProgressUpdateRequest kr2Update = new KeyResultProgressUpdateRequest(
                new BigDecimal("100.00"),
                "Test coverage reached 92% across all modules."
        );

        mockMvc.perform(put("/api/v1/performance/goals/" + goalResponse.id() + "/key-results/" + kr2Id + "/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(kr2Update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progressPercent").value(100.00))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // 6. List Goals
        mockMvc.perform(get("/api/v1/performance/goals")
                        .param("cycleId", cycleResponse.id().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].employeeName").value("Rizky Saputra"));
    }
}
