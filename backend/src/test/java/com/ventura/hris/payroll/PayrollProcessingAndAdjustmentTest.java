package com.ventura.hris.payroll;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import com.ventura.hris.attendance.repository.MonthlyAttendanceRecapRepository;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.EmployeeLoanCreateRequest;
import com.ventura.hris.payroll.dto.EmployeeReimbursementCreateRequest;
import com.ventura.hris.payroll.dto.PayrollRunExecutionRequest;
import com.ventura.hris.payroll.entity.EmployeeLoan;
import com.ventura.hris.payroll.entity.EmployeeSalaryProfile;
import com.ventura.hris.payroll.entity.PayrollPeriod;
import com.ventura.hris.payroll.repository.EmployeeLoanRepository;
import com.ventura.hris.payroll.repository.EmployeeReimbursementRepository;
import com.ventura.hris.payroll.repository.EmployeeSalaryProfileRepository;
import com.ventura.hris.payroll.repository.PayrollPeriodRepository;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PayrollProcessingAndAdjustmentTest {

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
    private EmployeeLoanRepository loanRepository;

    @Autowired
    private EmployeeReimbursementRepository reimbursementRepository;

    private Company company;
    private Branch branch;
    private Employee employee;
    private PayrollPeriod period;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-RUN1", "Payroll Run Co", "PT Run Ventura",
                "01.234.567.8-222.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-RUN1", "Main Branch", "Jl. Sudirman 100", null,
                "Jakarta", "DKI Jakarta", "10220", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-RUN001");
        employee.setFirstName("Budi");
        employee.setLastName("Santoso");
        employee.setWorkEmail("budi.santoso@example.com");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee = employeeRepository.save(employee);

        EmployeeSalaryProfile profile = new EmployeeSalaryProfile();
        profile.setEmployee(employee);
        profile.setBasicSalary(new BigDecimal("15000000.00"));
        profile.setCurrency("IDR");
        profile.setEffectiveDate(LocalDate.of(2025, 1, 1));
        profile.setPaymentMethod("BANK_TRANSFER");
        profile.setBankName("BCA");
        profile.setBankAccountNumber("1234567890");
        profile.setBankAccountHolder("Budi Santoso");
        profile.setTaxStatus("TK/0");
        profileRepository.save(profile);

        period = new PayrollPeriod();
        period.setCode("PR-2027-02");
        period.setName("February 2027 Payroll");
        period.setStartDate(LocalDate.of(2027, 2, 1));
        period.setEndDate(LocalDate.of(2027, 2, 28));
        period.setAttendanceCutoffDate(LocalDate.of(2027, 2, 20));
        period.setPayoutDate(LocalDate.of(2027, 2, 25));
        period.setStatus("ACTIVE");
        period.setTotalStandardWorkdays(20);
        period = periodRepository.save(period);

        MonthlyAttendanceRecap recap = new MonthlyAttendanceRecap(
                employee, 2027, 2, 20, 20, 0, 0, 0,
                new BigDecimal("10.00"), 0, 0, null, "LOCKED_FOR_PAYROLL"
        );
        recapRepository.save(recap);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateLoanAndGenerateInstallments() throws Exception {
        EmployeeLoanCreateRequest req = new EmployeeLoanCreateRequest(
                employee.getId(),
                new BigDecimal("12000000.00"),
                12,
                LocalDate.of(2027, 2, 1),
                "Smartphone installment assistance"
        );

        mockMvc.perform(post("/api/v1/payroll/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.loanAmount").value(12000000.00))
                .andExpect(jsonPath("$.data.installmentCount").value(12))
                .andExpect(jsonPath("$.data.monthlyInstallment").value(1000000.00))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testSubmitAndApproveReimbursement() throws Exception {
        EmployeeReimbursementCreateRequest req = new EmployeeReimbursementCreateRequest(
                employee.getId(),
                "Client Dinner Meeting",
                "MEAL",
                new BigDecimal("450000.00"),
                "https://storage.ventura.com/receipts/rec-001.pdf"
        );

        String response = mockMvc.perform(post("/api/v1/payroll/reimbursements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.amount").value(450000.00))
                .andReturn().getResponse().getContentAsString();

        String claimId = objectMapper.readTree(response).path("data").path("id").asText();

        mockMvc.perform(put("/api/v1/payroll/reimbursements/" + claimId + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testExecutePayrollRunBatchWithLoanAndReimbursement() throws Exception {
        // Setup loan: 6,000,000 over 6 months -> 1,000,000 / month
        EmployeeLoanCreateRequest loanReq = new EmployeeLoanCreateRequest(
                employee.getId(),
                new BigDecimal("6000000.00"),
                6,
                LocalDate.of(2027, 2, 1),
                "Emergency advance"
        );
        mockMvc.perform(post("/api/v1/payroll/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loanReq)))
                .andExpect(status().isCreated());

        // Setup reimbursement: 350,000
        EmployeeReimbursementCreateRequest claimReq = new EmployeeReimbursementCreateRequest(
                employee.getId(),
                "Medical checkup",
                "MEDICAL",
                new BigDecimal("350000.00"),
                null
        );
        String claimJson = mockMvc.perform(post("/api/v1/payroll/reimbursements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(claimReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String claimId = objectMapper.readTree(claimJson).path("data").path("id").asText();

        mockMvc.perform(put("/api/v1/payroll/reimbursements/" + claimId + "/approve"))
                .andExpect(status().isOk());

        // Execute batch payroll run
        PayrollRunExecutionRequest runReq = new PayrollRunExecutionRequest(
                period.getId(),
                LocalDate.of(2027, 2, 25)
        );

        String runResponse = mockMvc.perform(post("/api/v1/payroll/runs/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(runReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.totalEmployees").value(1))
                .andReturn().getResponse().getContentAsString();

        String runId = objectMapper.readTree(runResponse).path("data").path("id").asText();

        // Inspect items
        mockMvc.perform(get("/api/v1/payroll/runs/" + runId + "/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].basicSalary").value(15000000.00))
                .andExpect(jsonPath("$.data[0].reimbursementAmount").value(350000.00))
                .andExpect(jsonPath("$.data[0].loanDeductionAmount").value(1000000.00))
                .andExpect(jsonPath("$.data[0].netSalary", notNullValue()));

        // Check loan balance was reduced
        EmployeeLoan updatedLoan = loanRepository.findByEmployeeId(employee.getId()).get(0);
        assertEquals(new BigDecimal("5000000.00"), updatedLoan.getRemainingBalance());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testFreezePayrollRun() throws Exception {
        PayrollRunExecutionRequest runReq = new PayrollRunExecutionRequest(
                period.getId(),
                LocalDate.of(2027, 2, 25)
        );

        String runResponse = mockMvc.perform(post("/api/v1/payroll/runs/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(runReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String runId = objectMapper.readTree(runResponse).path("data").path("id").asText();

        mockMvc.perform(post("/api/v1/payroll/runs/" + runId + "/freeze"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("FROZEN"));
    }
}
