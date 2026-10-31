package com.ventura.hris.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.dto.AssignRosterRequest;
import com.ventura.hris.attendance.dto.BulkPatternRosterRequest;
import com.ventura.hris.attendance.dto.CompanyHolidayRequest;
import com.ventura.hris.attendance.dto.ShiftPatternRequest;
import com.ventura.hris.attendance.dto.ShiftRequest;
import com.ventura.hris.attendance.entity.Shift;
import com.ventura.hris.attendance.repository.CompanyHolidayRepository;
import com.ventura.hris.attendance.repository.RosterAssignmentRepository;
import com.ventura.hris.attendance.repository.ShiftPatternRepository;
import com.ventura.hris.attendance.repository.ShiftRepository;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShiftAndRosterSchedulingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftPatternRepository patternRepository;

    @Autowired
    private CompanyHolidayRepository holidayRepository;

    @Autowired
    private RosterAssignmentRepository rosterRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    private Company company;
    private Branch branch;
    private Employee employee;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-ATT", "Attendance Test Company", "PT Attendance Test",
                "01.234.567.8-901.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-ATT", "Attendance Branch", "Jl. Sudirman 1", null,
                "Jakarta Selatan", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-ATT-001");
        employee.setFirstName("Alice");
        employee.setLastName("Walker");
        employee.setWorkEmail("alice.walker@ventura.local");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee = employeeRepository.save(employee);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testCreateAndListShifts() throws Exception {
        ShiftRequest request = new ShiftRequest(
                "SH_FLEX_0918",
                "Flexible Office",
                "9 to 6 with 15m grace",
                LocalTime.of(9, 0),
                LocalTime.of(18, 0),
                60,
                15,
                false,
                true
        );

        mockMvc.perform(post("/api/v1/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("SH_FLEX_0918")))
                .andExpect(jsonPath("$.data.startTime", is("09:00:00")));

        mockMvc.perform(get("/api/v1/shifts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testCreateDuplicateShiftCodeFails() throws Exception {
        ShiftRequest request = new ShiftRequest(
                "SH_DUP_01",
                "Shift Duplicate",
                null,
                LocalTime.of(8, 0),
                LocalTime.of(17, 0),
                60,
                10,
                false,
                true
        );

        mockMvc.perform(post("/api/v1/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testCompanyHolidayCrud() throws Exception {
        CompanyHolidayRequest request = new CompanyHolidayRequest(
                LocalDate.of(2026, 5, 1),
                "Labor Day",
                "International Workers Day",
                company.getId(),
                null,
                true
        );

        mockMvc.perform(post("/api/v1/holidays")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Labor Day")));

        mockMvc.perform(get("/api/v1/holidays")
                        .param("startDate", "2026-05-01")
                        .param("endDate", "2026-05-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Labor Day")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testAssignAndQueryRoster() throws Exception {
        Shift shift = new Shift();
        shift.setCode("SH_ROST_01");
        shift.setName("Roster Shift");
        shift.setStartTime(LocalTime.of(8, 0));
        shift.setEndTime(LocalTime.of(17, 0));
        shift = shiftRepository.save(shift);

        LocalDate date = LocalDate.of(2026, 11, 10);
        AssignRosterRequest request = new AssignRosterRequest(
                employee.getId(),
                shift.getId(),
                date,
                false,
                "Normal schedule"
        );

        mockMvc.perform(post("/api/v1/roster/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.employeeNumber", is("EMP-ATT-001")))
                .andExpect(jsonPath("$.data.shiftCode", is("SH_ROST_01")));

        mockMvc.perform(get("/api/v1/roster")
                        .param("startDate", "2026-11-09")
                        .param("endDate", "2026-11-15")
                        .param("employeeId", employee.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].shiftCode", is("SH_ROST_01")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testBulkPatternAssign() throws Exception {
        Shift s1 = new Shift();
        s1.setCode("SH_DAY");
        s1.setName("Day Shift");
        s1.setStartTime(LocalTime.of(8, 0));
        s1.setEndTime(LocalTime.of(16, 0));
        shiftRepository.save(s1);

        ShiftPatternRequest patternReq = new ShiftPatternRequest(
                "PAT_2_2",
                "2 Day 2 Off Pattern",
                "2 days on then 2 off",
                "SH_DAY,SH_DAY,OFF,OFF",
                4,
                true
        );

        String patternRespStr = mockMvc.perform(post("/api/v1/shifts/patterns")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patternReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        var patternNode = objectMapper.readTree(patternRespStr);
        String patternId = patternNode.get("data").get("id").asText();

        BulkPatternRosterRequest bulkReq = new BulkPatternRosterRequest(
                List.of(employee.getId()),
                java.util.UUID.fromString(patternId),
                LocalDate.of(2026, 11, 9), // Monday: day 0 -> SH_DAY
                LocalDate.of(2026, 11, 12) // Thursday: day 3 -> OFF
        );

        mockMvc.perform(post("/api/v1/roster/bulk-pattern")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assignedCount", is(4)));

        mockMvc.perform(get("/api/v1/roster")
                        .param("startDate", "2026-11-09")
                        .param("endDate", "2026-11-12")
                        .param("employeeId", employee.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(4)))
                .andExpect(jsonPath("$.data[0].shiftCode", is("SH_DAY")))
                .andExpect(jsonPath("$.data[0].isDayOff", is(false)))
                .andExpect(jsonPath("$.data[2].isDayOff", is(true)));
    }
}
