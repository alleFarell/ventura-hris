package com.ventura.hris.payroll;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import com.ventura.hris.attendance.repository.MonthlyAttendanceRecapRepository;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.BankDisbursalGenerateRequest;
import com.ventura.hris.payroll.dto.PayrollRunExecutionRequest;
import com.ventura.hris.payroll.dto.PayrollRunResponse;
import com.ventura.hris.payroll.entity.EmployeeSalaryProfile;
import com.ventura.hris.payroll.entity.PayrollPeriod;
import com.ventura.hris.payroll.repository.EmployeeSalaryProfileRepository;
import com.ventura.hris.payroll.repository.PayrollPeriodRepository;
import com.ventura.hris.payroll.service.PayrollProcessingService;
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
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PayslipAndBankDisbursalTest {

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
    private EmployeeSalaryProfileRepository profileRepository;

    @Autowired
    private MonthlyAttendanceRecapRepository recapRepository;

    @Autowired
    private PayrollPeriodRepository periodRepository;

    @Autowired
    private PayrollProcessingService processingService;

    private Company company;
    private Branch branch;
    private Employee employee;
    private PayrollPeriod period;
    private PayrollRunResponse runResponse;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-PAY1", "Payslip Co", "PT Payslip Ventura",
                "01.234.567.8-333.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-PAY1", "Main Branch", "Jl. Thamrin 10", null,
                "Jakarta", "DKI Jakarta", "10350", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-PAY001");
        employee.setFirstName("Rudi");
        employee.setLastName("Hermawan");
        employee.setWorkEmail("rudi.hermawan@example.com");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee = employeeRepository.save(employee);

        EmployeeSalaryProfile profile = new EmployeeSalaryProfile();
        profile.setEmployee(employee);
        profile.setBasicSalary(new BigDecimal("12000000.00"));
        profile.setCurrency("IDR");
        profile.setEffectiveDate(LocalDate.of(2025, 1, 1));
        profile.setPaymentMethod("BANK_TRANSFER");
        profile.setBankName("BCA");
        profile.setBankAccountNumber("8887776665");
        profile.setBankAccountHolder("Rudi Hermawan");
        profile.setTaxStatus("TK/0");
        profileRepository.save(profile);

        period = new PayrollPeriod();
        period.setCode("PR-2027-03");
        period.setName("March 2027 Payroll");
        period.setStartDate(LocalDate.of(2027, 3, 1));
        period.setEndDate(LocalDate.of(2027, 3, 31));
        period.setAttendanceCutoffDate(LocalDate.of(2027, 3, 20));
        period.setPayoutDate(LocalDate.of(2027, 3, 25));
        period.setStatus("ACTIVE");
        period.setTotalStandardWorkdays(20);
        period = periodRepository.save(period);

        MonthlyAttendanceRecap recap = new MonthlyAttendanceRecap(
                employee, 2027, 3, 20, 20, 0, 0, 0,
                new BigDecimal("5.00"), 0, 0, null, "LOCKED_FOR_PAYROLL"
        );
        recapRepository.save(recap);

        runResponse = processingService.executePayrollRun(
                new PayrollRunExecutionRequest(period.getId(), LocalDate.of(2027, 3, 25)),
                "admin"
        );
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testGeneratePayslipsFromPayrollRun() throws Exception {
        mockMvc.perform(post("/api/v1/payroll/payslips/generate/" + runResponse.id()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].employeeName").value("Rudi Hermawan"))
                .andExpect(jsonPath("$.data[0].grossSalary").value(greaterThan(12000000.0)))
                .andExpect(jsonPath("$.data[0].netSalary").value(notNullValue()))
                .andExpect(jsonPath("$.data[0].isPublished").value(true));

        mockMvc.perform(get("/api/v1/payroll/payslips?employeeId=" + employee.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].payslipNumber", startsWith("PS-PR-2027-03-EMP-PAY001")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testGenerateBankDisbursalBatch() throws Exception {
        BankDisbursalGenerateRequest req = new BankDisbursalGenerateRequest(runResponse.id(), "BCA");

        String response = mockMvc.perform(post("/api/v1/payroll/disbursals/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("GENERATED"))
                .andExpect(jsonPath("$.data.bankCode").value("BCA"))
                .andExpect(jsonPath("$.data.totalRecords").value(1))
                .andExpect(jsonPath("$.data.fileContent", containsString("8887776665")))
                .andExpect(jsonPath("$.data.fileContent", containsString("Rudi Hermawan")))
                .andReturn().getResponse().getContentAsString();

        String batchId = objectMapper.readTree(response).path("data").path("id").asText();

        mockMvc.perform(get("/api/v1/payroll/disbursals/" + batchId + "/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].accountNumber").value("8887776665"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testUpdateDisbursalStatus() throws Exception {
        BankDisbursalGenerateRequest req = new BankDisbursalGenerateRequest(runResponse.id(), "MANDIRI");

        String response = mockMvc.perform(post("/api/v1/payroll/disbursals/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String batchId = objectMapper.readTree(response).path("data").path("id").asText();

        mockMvc.perform(put("/api/v1/payroll/disbursals/" + batchId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "DISBURSED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DISBURSED"));
    }
}
