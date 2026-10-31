package com.ventura.hris.payroll;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.entity.BenefitPlan;
import com.ventura.hris.payroll.repository.BenefitPlanRepository;
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
class BenefitsAndBpjsTest {

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
    private BenefitPlanRepository benefitPlanRepository;

    private Employee employee;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        Company company = new Company(
                "CMP-BEN1", "Benefits Co", "PT Benefits Ventura",
                "01.234.567.8-333.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-BEN1", "Main Branch", "Jl. Thamrin 10", null,
                "Jakarta", "DKI Jakarta", "10350", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-BEN-001");
        employee.setFirstName("Rina");
        employee.setLastName("Kusuma");
        employee.setWorkEmail("rina.kusuma@ventura.com");
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee = employeeRepository.save(employee);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldCalculateBpjsCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/payroll/bpjs/calculate")
                        .param("baseWage", "10000000")
                        .param("jkkRiskGrade", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(5)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldEnrollEmployeeInBpjs() throws Exception {
        EmployeeBpjsEnrollmentRequest req = new EmployeeBpjsEnrollmentRequest(
                employee.getId(),
                "0001234567890",
                "0009876543210",
                2,
                true,
                true
        );

        mockMvc.perform(post("/api/v1/payroll/bpjs/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.employeeNumber").value("EMP-BEN-001"))
                .andExpect(jsonPath("$.data.bpjsKesNumber").value("0001234567890"))
                .andExpect(jsonPath("$.data.jkkRiskGrade").value(2));

        mockMvc.perform(get("/api/v1/payroll/bpjs/enrollments/" + employee.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bpjsTkNumber").value("0009876543210"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldCreateBenefitPlanAndProcessClaims() throws Exception {
        // 1. Create Benefit Plan (Dental - 5,000,000 annual limit)
        BenefitPlanRequest planReq = new BenefitPlanRequest(
                "DENT-01",
                "Annual Dental Coverage",
                "DENTAL",
                new BigDecimal("5000000.00"),
                "Corporate dental reimbursement program",
                true
        );

        String planJson = mockMvc.perform(post("/api/v1/payroll/benefits/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("DENT-01"))
                .andReturn().getResponse().getContentAsString();

        BenefitPlanResponse planResp = objectMapper.readValue(
                objectMapper.readTree(planJson).get("data").toString(),
                BenefitPlanResponse.class
        );

        // 2. Submit Claim within quota (1,500,000)
        EmployeeBenefitClaimRequest claimReq = new EmployeeBenefitClaimRequest(
                employee.getId(),
                planResp.id(),
                LocalDate.now(),
                new BigDecimal("1500000.00"),
                "Root canal treatment",
                "https://storage.ventura.com/receipts/dent-001.pdf"
        );

        String claimJson = mockMvc.perform(post("/api/v1/payroll/benefits/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(claimReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.amount").value(1500000.00))
                .andReturn().getResponse().getContentAsString();

        EmployeeBenefitClaimResponse claimResp = objectMapper.readValue(
                objectMapper.readTree(claimJson).get("data").toString(),
                EmployeeBenefitClaimResponse.class
        );

        // 3. Approve Claim
        BenefitClaimStatusUpdateRequest statusReq = new BenefitClaimStatusUpdateRequest(
                "APPROVED",
                employee.getId(),
                null
        );

        mockMvc.perform(put("/api/v1/payroll/benefits/claims/" + claimResp.id() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 4. Submit Claim that exceeds remaining limit (remaining is 3,500,000; try 4,000,000)
        EmployeeBenefitClaimRequest excessReq = new EmployeeBenefitClaimRequest(
                employee.getId(),
                planResp.id(),
                LocalDate.now(),
                new BigDecimal("4000000.00"),
                "Cosmetic veneers",
                null
        );

        mockMvc.perform(post("/api/v1/payroll/benefits/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(excessReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
