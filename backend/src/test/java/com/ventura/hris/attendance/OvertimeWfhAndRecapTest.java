package com.ventura.hris.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.dto.AttendanceRecapGenerateRequest;
import com.ventura.hris.attendance.dto.OvertimeActionRequest;
import com.ventura.hris.attendance.dto.OvertimeRequestCreateRequest;
import com.ventura.hris.attendance.dto.WfhActionRequest;
import com.ventura.hris.attendance.dto.WfhRequestCreateRequest;
import com.ventura.hris.attendance.entity.AttendanceRecord;
import com.ventura.hris.attendance.repository.AttendanceRecordRepository;
import com.ventura.hris.attendance.service.WfhService;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
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
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OvertimeWfhAndRecapTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private WfhService wfhService;

    private Company company;
    private Branch branch;
    private Employee employee;
    private Employee manager;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-OT1", "Overtime WFH Company", "PT Overtime Solutions",
                "01.234.567.8-904.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-OT1", "Overtime Branch", "Jl. Rasuna Said 2", null,
                "Jakarta", "DKI Jakarta", "12950", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        manager = new Employee();
        manager.setCompany(company);
        manager.setBranch(branch);
        manager.setEmployeeNumber("MGR-OT-001");
        manager.setFirstName("Alice");
        manager.setLastName("Wong");
        manager.setWorkEmail("alice.wong@ventura.local");
        manager.setEmploymentStatus(EmploymentStatus.ACTIVE);
        manager.setHireDate(LocalDate.of(2024, 1, 1));
        manager = employeeRepository.save(manager);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-OT-001");
        employee.setFirstName("David");
        employee.setLastName("Beckham");
        employee.setWorkEmail("david.beckham@ventura.local");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee = employeeRepository.save(employee);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testWfhSubmissionAndApprovalFlow() throws Exception {
        LocalDate wfhDate = LocalDate.of(2026, 11, 4);

        WfhRequestCreateRequest req = new WfhRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setRequestDate(wfhDate);
        req.setReason("Severe rain and flooding in residential area");
        req.setApproverId(manager.getId());

        String resJson = mockMvc.perform(post("/api/v1/attendance/wfh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.requestDate").value(wfhDate.toString()))
                .andReturn().getResponse().getContentAsString();

        String wfhId = objectMapper.readTree(resJson).path("data").path("id").asText();

        // Duplicate submission prevention
        mockMvc.perform(post("/api/v1/attendance/wfh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("DUPLICATE_WFH_REQUEST"));

        // Manager approves
        WfhActionRequest action = new WfhActionRequest();
        action.setComments("Approved, stay safe and check in online.");

        mockMvc.perform(post("/api/v1/attendance/wfh/" + wfhId + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.managerComment").value("Approved, stay safe and check in online."));

        assertTrue(wfhService.isWfhApproved(employee.getId(), wfhDate));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testOvertimeRegularDayStatutoryMultiplier() throws Exception {
        // Monday 2026-11-09: 3 hours overtime (18:00 - 21:00)
        // 1st hr = 1.0 * 1.5 = 1.5
        // Next 2 hrs = 2.0 * 2.0 = 4.0 -> Total 5.50 multiplier hours
        LocalDate date = LocalDate.of(2026, 11, 9);

        OvertimeRequestCreateRequest req = new OvertimeRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setOvertimeDate(date);
        req.setStartTime(LocalTime.of(18, 0));
        req.setEndTime(LocalTime.of(21, 0));
        req.setReason("Q4 release critical bug fixes");
        req.setApproverId(manager.getId());

        String resJson = mockMvc.perform(post("/api/v1/attendance/overtime")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rawHours").value(3.0))
                .andExpect(jsonPath("$.data.multiplierHours").value(5.5))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andReturn().getResponse().getContentAsString();

        String otId = objectMapper.readTree(resJson).path("data").path("id").asText();

        // Manager approves
        OvertimeActionRequest action = new OvertimeActionRequest();
        action.setComments("Approved with standard statutory multiplier");

        mockMvc.perform(post("/api/v1/attendance/overtime/" + otId + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testOvertimeWeekendAndHolidayMultiplier() throws Exception {
        // Saturday 2026-11-14: 4 hours overtime (09:00 - 13:00)
        // Rest day multiplier = 4.0 * 2.0 = 8.00 multiplier hours
        LocalDate date = LocalDate.of(2026, 11, 14);

        OvertimeRequestCreateRequest req = new OvertimeRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setOvertimeDate(date);
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(13, 0));
        req.setReason("Saturday infrastructure migration");
        req.setApproverId(manager.getId());

        mockMvc.perform(post("/api/v1/attendance/overtime")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rawHours").value(4.0))
                .andExpect(jsonPath("$.data.multiplierHours").value(8.0))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testMonthlyAttendanceRecapAggregationAndPayrollLock() throws Exception {
        int year = 2026;
        int month = 11;

        // Seed 2 attendance records in November
        AttendanceRecord rec1 = new AttendanceRecord();
        rec1.setEmployee(employee);
        rec1.setRecordDate(LocalDate.of(year, month, 2));
        rec1.setStatus("PRESENT");
        rec1.setLateMinutes(0);
        rec1.setWorkingHours(new BigDecimal("8.00"));
        recordRepository.save(rec1);

        AttendanceRecord rec2 = new AttendanceRecord();
        rec2.setEmployee(employee);
        rec2.setRecordDate(LocalDate.of(year, month, 3));
        rec2.setStatus("LATE");
        rec2.setLateMinutes(25);
        rec2.setWorkingHours(new BigDecimal("7.50"));
        recordRepository.save(rec2);

        // Generate Recap
        AttendanceRecapGenerateRequest genReq = new AttendanceRecapGenerateRequest();
        genReq.setPeriodYear(year);
        genReq.setPeriodMonth(month);

        String genRes = mockMvc.perform(post("/api/v1/attendance/recaps/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(genReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2))) // manager + employee
                .andExpect(jsonPath("$.data[?(@.employeeNumber == 'EMP-OT-001')].totalDaysPresent").value(2))
                .andExpect(jsonPath("$.data[?(@.employeeNumber == 'EMP-OT-001')].totalLateMinutes").value(25))
                .andReturn().getResponse().getContentAsString();

        String recapId = objectMapper.readTree(genRes).path("data").get(1).path("id").asText();

        // Lock single recap for payroll
        mockMvc.perform(put("/api/v1/attendance/recaps/" + recapId + "/lock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("LOCKED_FOR_PAYROLL"));

        // Attempting to lock again should return 400
        mockMvc.perform(put("/api/v1/attendance/recaps/" + recapId + "/lock"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("ALREADY_LOCKED"));
    }
}
