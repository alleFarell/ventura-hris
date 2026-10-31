package com.ventura.hris.payroll;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.organization.entity.Grade;
import com.ventura.hris.organization.repository.GradeRepository;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.entity.SalaryComponent;
import com.ventura.hris.payroll.repository.SalaryComponentRepository;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SalaryStructureAndTaxCalculationTest {

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
    private GradeRepository gradeRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SalaryComponentRepository componentRepository;

    private Company company;
    private Branch branch;
    private Grade grade;
    private Employee employee;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-PAY1", "Payroll Testing Co", "PT Payroll Ventura",
                "01.234.567.8-999.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-PAY1", "Jakarta Head Office", "Jl. Sudirman 1", null,
                "Jakarta", "DKI Jakarta", "10220", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        grade = new Grade();
        grade.setCompany(company);
        grade.setCode("GRD-M1");
        grade.setName("Mid-Level Software Engineer");
        grade.setSortOrder(3);
        grade.setStatus("ACTIVE");
        grade = gradeRepository.save(grade);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setGrade(grade);
        employee.setEmployeeNumber("EMP-PAY-001");
        employee.setFirstName("Sarah");
        employee.setLastName("Connor");
        employee.setWorkEmail("sarah.connor@ventura.local");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 2, 1));
        employee = employeeRepository.save(employee);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateAndListSalaryComponents() throws Exception {
        SalaryComponentCreateRequest req = new SalaryComponentCreateRequest();
        req.setCode("INTERNET_ALLOWANCE");
        req.setName("Internet & Phone Subsidy");
        req.setDescription("Monthly connectivity stipend");
        req.setType("EARNING_FIXED");
        req.setIsTaxable(true);
        req.setIsBpjsApplicable(false);
        req.setDefaultAmount(new BigDecimal("350000.00"));

        mockMvc.perform(post("/api/v1/payroll/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("INTERNET_ALLOWANCE"))
                .andExpect(jsonPath("$.data.defaultAmount").value(350000.00));

        // Verify in list
        mockMvc.perform(get("/api/v1/payroll/components"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateSalaryStructureAndValidation() throws Exception {
        // Invalid boundaries (min > mid)
        SalaryStructureCreateRequest invalidReq = new SalaryStructureCreateRequest();
        invalidReq.setGradeId(grade.getId());
        invalidReq.setMinSalary(new BigDecimal("12000000.00"));
        invalidReq.setMidpointSalary(new BigDecimal("10000000.00"));
        invalidReq.setMaxSalary(new BigDecimal("15000000.00"));

        mockMvc.perform(post("/api/v1/payroll/structures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());

        // Valid boundaries
        SalaryStructureCreateRequest validReq = new SalaryStructureCreateRequest();
        validReq.setGradeId(grade.getId());
        validReq.setMinSalary(new BigDecimal("8000000.00"));
        validReq.setMidpointSalary(new BigDecimal("12000000.00"));
        validReq.setMaxSalary(new BigDecimal("16000000.00"));

        mockMvc.perform(post("/api/v1/payroll/structures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.gradeCode").value("GRD-M1"))
                .andExpect(jsonPath("$.data.minSalary").value(8000000.00))
                .andExpect(jsonPath("$.data.maxSalary").value(16000000.00));

        // Get by grade
        mockMvc.perform(get("/api/v1/payroll/structures/grade/" + grade.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.midpointSalary").value(12000000.00));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testTaxCalculationProgressiveEngine() throws Exception {
        // Annual gross: 120,000,000 with TK/0 (PTKP: 54,000,000)
        // Taxable: 66,000,000
        // Tier 1 (0 - 60M @ 5%): 60M * 0.05 = 3,000,000
        // Tier 2 (60M - 250M @ 15%): 6M * 0.15 = 900,000
        // Total Annual Tax: 3,900,000. Monthly: 325,000
        TaxCalculationRequest req = new TaxCalculationRequest();
        req.setAnnualGrossIncome(new BigDecimal("120000000.00"));
        req.setTaxStatus("TK/0");
        req.setTaxYear(2026);

        mockMvc.perform(post("/api/v1/payroll/tax-config/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.annualGrossIncome").value(120000000.00))
                .andExpect(jsonPath("$.data.ptkpAmount").value(54000000.00))
                .andExpect(jsonPath("$.data.annualTaxableIncome").value(66000000.00))
                .andExpect(jsonPath("$.data.annualTaxAmount").value(3900000.00))
                .andExpect(jsonPath("$.data.monthlyTaxAmount").value(325000.00));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testEmployeeSalaryProfileAndGradeBoundary() throws Exception {
        // Create Salary Structure for grade (8M - 16M)
        SalaryStructureCreateRequest structReq = new SalaryStructureCreateRequest();
        structReq.setGradeId(grade.getId());
        structReq.setMinSalary(new BigDecimal("8000000.00"));
        structReq.setMidpointSalary(new BigDecimal("12000000.00"));
        structReq.setMaxSalary(new BigDecimal("16000000.00"));

        mockMvc.perform(post("/api/v1/payroll/structures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(structReq)))
                .andExpect(status().isOk());

        // Get an active salary component (e.g. Transport Allowance)
        SalaryComponent transport = componentRepository.findByCodeIgnoreCase("TRANSPORT_ALLOWANCE")
                .orElseGet(() -> {
                    SalaryComponent c = new SalaryComponent("TRANSPORT_ALLOWANCE", "Transport Allowance", null, "EARNING_FIXED", true, false, new BigDecimal("500000.00"));
                    return componentRepository.save(c);
                });

        // Set employee salary within grade: 10,000,000 + 500,000 allowance = 10,500,000
        EmployeeSalaryProfileRequest profileReq = new EmployeeSalaryProfileRequest();
        profileReq.setBasicSalary(new BigDecimal("10000000.00"));
        profileReq.setCurrency("IDR");
        profileReq.setEffectiveDate(LocalDate.of(2025, 2, 1));
        profileReq.setPaymentMethod("BANK_TRANSFER");
        profileReq.setBankName("BCA");
        profileReq.setBankAccountNumber("8881234567");
        profileReq.setBankAccountHolder("Sarah Connor");
        profileReq.setTaxStatus("TK/0");
        profileReq.setComponents(List.of(
                new EmployeeSalaryComponentItem(transport.getId(), transport.getCode(), transport.getName(), transport.getType(), new BigDecimal("500000.00"))
        ));

        mockMvc.perform(put("/api/v1/payroll/compensation/" + employee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.basicSalary").value(10000000.00))
                .andExpect(jsonPath("$.data.isWithinGradeRange").value(true))
                .andExpect(jsonPath("$.data.totalFixedAllowances").value(500000.00))
                .andExpect(jsonPath("$.data.totalTakeHomePay").value(10500000.00));

        // Test salary outside grade boundary: 18,000,000 (> 16M max)
        profileReq.setBasicSalary(new BigDecimal("18000000.00"));
        mockMvc.perform(put("/api/v1/payroll/compensation/" + employee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.basicSalary").value(18000000.00))
                .andExpect(jsonPath("$.data.isWithinGradeRange").value(false));
    }
}
