package com.ventura.hris.payroll;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.entity.MonthlyAttendanceRecap;
import com.ventura.hris.attendance.repository.MonthlyAttendanceRecapRepository;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.EmployeeSalaryProfileRequest;
import com.ventura.hris.payroll.dto.PayrollPeriodCreateRequest;
import com.ventura.hris.payroll.dto.PayrollPeriodStatusUpdateRequest;
import com.ventura.hris.payroll.entity.EmployeeSalaryProfile;
import com.ventura.hris.payroll.entity.PayrollPeriod;
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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PayrollCalculationAndAttendanceIntegrationTest {

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

    private Company company;
    private Branch branch;
    private Employee regularEmployee;
    private Employee newHireEmployee;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-INT1", "Integration Co", "PT Integration Ventura",
                "01.234.567.8-111.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-INT1", "Jakarta HQ", "Jl. Gatot Subroto", null,
                "Jakarta", "DKI Jakarta", "12930", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        regularEmployee = new Employee();
        regularEmployee.setCompany(company);
        regularEmployee.setBranch(branch);
        regularEmployee.setEmployeeNumber("EMP-INT-001");
        regularEmployee.setFirstName("Michael");
        regularEmployee.setLastName("Scott");
        regularEmployee.setWorkEmail("michael.scott@ventura.local");
        regularEmployee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        regularEmployee.setHireDate(LocalDate.of(2024, 1, 1));
        regularEmployee = employeeRepository.save(regularEmployee);

        EmployeeSalaryProfile profile1 = new EmployeeSalaryProfile(
                regularEmployee, new BigDecimal("10000000.00"), "IDR",
                LocalDate.of(2024, 1, 1), "BANK_TRANSFER", "BCA",
                "1234567890", "Michael Scott", "TK/0"
        );
        profileRepository.save(profile1);

        newHireEmployee = new Employee();
        newHireEmployee.setCompany(company);
        newHireEmployee.setBranch(branch);
        newHireEmployee.setEmployeeNumber("EMP-INT-002");
        newHireEmployee.setFirstName("Jim");
        newHireEmployee.setLastName("Halpert");
        newHireEmployee.setWorkEmail("jim.halpert@ventura.local");
        newHireEmployee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        newHireEmployee.setHireDate(LocalDate.of(2026, 1, 16)); // Mid-month hire
        newHireEmployee = employeeRepository.save(newHireEmployee);

        EmployeeSalaryProfile profile2 = new EmployeeSalaryProfile(
                newHireEmployee, new BigDecimal("12000000.00"), "IDR",
                LocalDate.of(2026, 1, 16), "BANK_TRANSFER", "Mandiri",
                "9876543210", "Jim Halpert", "TK/0"
        );
        profileRepository.save(profile2);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreatePayrollPeriodAndStatusLifecycle() throws Exception {
        PayrollPeriodCreateRequest req = new PayrollPeriodCreateRequest();
        req.setCode("PAY-2026-01");
        req.setName("January 2026 Payroll Cycle");
        req.setStartDate(LocalDate.of(2026, 1, 1));
        req.setEndDate(LocalDate.of(2026, 1, 31));
        req.setAttendanceCutoffDate(LocalDate.of(2026, 1, 25));
        req.setPayoutDate(LocalDate.of(2026, 1, 31));
        req.setTotalStandardWorkdays(20);

        String resJson = mockMvc.perform(post("/api/v1/payroll/periods")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("PAY-2026-01"))
                .andExpect(jsonPath("$.data.status").value("PLANNED"))
                .andReturn().getResponse().getContentAsString();

        String periodId = objectMapper.readTree(resJson).path("data").path("id").asText();

        // Update status to ACTIVE
        PayrollPeriodStatusUpdateRequest statusReq = new PayrollPeriodStatusUpdateRequest();
        statusReq.setStatus("ACTIVE");

        mockMvc.perform(put("/api/v1/payroll/periods/" + periodId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testIngestAttendanceAndDeductionCalculation() throws Exception {
        PayrollPeriod period = new PayrollPeriod(
                "PAY-2026-01-ATT", "Jan 2026 Attendance Ingest",
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31),
                LocalDate.of(2026, 1, 25), LocalDate.of(2026, 1, 31), 20
        );
        period = periodRepository.save(period);

        // Seed MonthlyAttendanceRecap for regularEmployee: 1 absent, 1 unpaid leave, 60 min late, 10 hours overtime
        MonthlyAttendanceRecap recap = new MonthlyAttendanceRecap(
                regularEmployee, 2026, 1, 20, 18, 1, 60, 0,
                new BigDecimal("10.00"), 0, 1, null, "LOCKED_FOR_PAYROLL"
        );
        recapRepository.save(recap);

        // Trigger attendance ingestion
        mockMvc.perform(post("/api/v1/payroll/periods/" + period.getId() + "/attendance/ingest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));

        // Verify ingested cutoff records
        mockMvc.perform(get("/api/v1/payroll/periods/" + period.getId() + "/attendance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + regularEmployee.getId() + "')].overtimePayAmount",
                        hasItem(greaterThan(500000.0))))
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + regularEmployee.getId() + "')].unpaidLeaveDeductionAmount",
                        hasItem(greaterThan(900000.0))));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testMidMonthHireProrationAndSimulation() throws Exception {
        PayrollPeriod period = new PayrollPeriod(
                "PAY-2026-01-SIM", "Jan 2026 Simulation",
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31),
                LocalDate.of(2026, 1, 25), LocalDate.of(2026, 1, 31), 20
        );
        period = periodRepository.save(period);

        // Run simulation
        mockMvc.perform(post("/api/v1/payroll/periods/" + period.getId() + "/simulation/simulate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)));

        // Retrieve simulations
        mockMvc.perform(get("/api/v1/payroll/periods/" + period.getId() + "/simulation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                // Verify regular employee gets 100% (factor = 1.0)
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + regularEmployee.getId() + "')].prorationFactor",
                        hasItem(1.0)))
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + regularEmployee.getId() + "')].proratedBasicSalary",
                        hasItem(10000000.00)))
                // Verify mid-month hire employee (Jan 16) receives prorated basic (~16/31 * 12M ~ 6.19M)
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + newHireEmployee.getId() + "')].prorationFactor",
                        hasItem(lessThan(1.0))))
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + newHireEmployee.getId() + "')].proratedBasicSalary",
                        hasItem(lessThan(12000000.00))));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testDiscrepancyFlaggingInSimulation() throws Exception {
        PayrollPeriod period = new PayrollPeriod(
                "PAY-2026-01-DISC", "Jan 2026 Discrepancy Flagging",
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31),
                LocalDate.of(2026, 1, 25), LocalDate.of(2026, 1, 31), 20
        );
        period = periodRepository.save(period);

        // Seed 4 absent days (> 3 threshold) for regular employee
        MonthlyAttendanceRecap excessiveAbsenceRecap = new MonthlyAttendanceRecap(
                regularEmployee, 2026, 1, 20, 16, 4, 0, 0,
                BigDecimal.ZERO, 0, 0, null, "LOCKED_FOR_PAYROLL"
        );
        recapRepository.save(excessiveAbsenceRecap);

        mockMvc.perform(post("/api/v1/payroll/periods/" + period.getId() + "/simulation/simulate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + regularEmployee.getId() + "')].hasDiscrepancies",
                        hasItem(true)))
                .andExpect(jsonPath("$.data[?(@.employeeId == '" + regularEmployee.getId() + "')].discrepancyNote",
                        hasItem(containsString("Excessive absent days"))));
    }
}
