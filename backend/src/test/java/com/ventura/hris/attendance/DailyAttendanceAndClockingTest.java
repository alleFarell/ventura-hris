package com.ventura.hris.attendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.dto.BiometricPunchImportRequest;
import com.ventura.hris.attendance.dto.ClockInRequest;
import com.ventura.hris.attendance.dto.ClockOutRequest;
import com.ventura.hris.attendance.entity.Shift;
import com.ventura.hris.attendance.repository.AttendancePunchLogRepository;
import com.ventura.hris.attendance.repository.AttendanceRecordRepository;
import com.ventura.hris.attendance.repository.BiometricDeviceRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DailyAttendanceAndClockingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private AttendancePunchLogRepository punchLogRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BiometricDeviceRepository deviceRepository;

    private Company company;
    private Branch branch;
    private Employee employee;
    private Shift shift;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-ATT2", "Attendance Daily Company", "PT Daily Attendance",
                "01.234.567.8-902.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-ATT2", "Daily Branch", "Jl. Gatot Subroto 1", null,
                "Jakarta", "DKI Jakarta", "12930", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-CLK-001");
        employee.setFirstName("Bob");
        employee.setLastName("Miller");
        employee.setWorkEmail("bob.miller@ventura.local");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee = employeeRepository.save(employee);

        shift = new Shift();
        shift.setCode("SH_OFFICE_0817");
        shift.setName("Standard Office");
        shift.setStartTime(LocalTime.of(8, 0));
        shift.setEndTime(LocalTime.of(17, 0));
        shift.setGracePeriodMinutes(15);
        shift.setBreakMinutes(60);
        shift = shiftRepository.save(shift);

        com.ventura.hris.attendance.entity.BiometricDevice dev = new com.ventura.hris.attendance.entity.BiometricDevice();
        dev.setCode("DEV_HQ_01");
        dev.setName("HQ Main Entrance");
        dev.setIpAddress("192.168.1.201");
        dev.setPort(4370);
        dev.setIsActive(true);
        deviceRepository.save(dev);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testClockInAndClockOutFlow() throws Exception {
        ClockInRequest inReq = new ClockInRequest(
                employee.getId(),
                BigDecimal.valueOf(-6.2088),
                BigDecimal.valueOf(106.8456),
                "192.168.1.50",
                "Chrome MacOS",
                "Morning punch"
        );

        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.employeeNumber", is("EMP-CLK-001")))
                .andExpect(jsonPath("$.data.clockInTime", notNullValue()));

        ClockOutRequest outReq = new ClockOutRequest(
                employee.getId(),
                BigDecimal.valueOf(-6.2088),
                BigDecimal.valueOf(106.8456),
                "192.168.1.50",
                "Chrome MacOS",
                "Evening punch"
        );

        mockMvc.perform(post("/api/v1/attendance/clock-out")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.clockOutTime", notNullValue()));

        mockMvc.perform(get("/api/v1/attendance/my-today")
                        .param("employeeId", employee.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.clockInTime", notNullValue()))
                .andExpect(jsonPath("$.data.clockOutTime", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testDuplicateClockInFails() throws Exception {
        ClockInRequest inReq = new ClockInRequest(
                employee.getId(),
                BigDecimal.valueOf(-6.2088),
                BigDecimal.valueOf(106.8456),
                "192.168.1.50",
                "Web",
                null
        );

        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inReq)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("ALREADY_CLOCKED_IN")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testClockOutWithoutClockInFails() throws Exception {
        ClockOutRequest outReq = new ClockOutRequest(
                employee.getId(),
                null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/attendance/clock-out")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("NO_CLOCK_IN")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void testBiometricPunchesImport() throws Exception {
        BiometricPunchImportRequest req = new BiometricPunchImportRequest(
                "DEV_HQ_01",
                List.of(
                        new BiometricPunchImportRequest.BiometricPunchItem(
                                "EMP-CLK-001",
                                Instant.parse("2026-11-25T01:00:00Z"),
                                "CLOCK_IN"
                        ),
                        new BiometricPunchImportRequest.BiometricPunchItem(
                                "EMP-CLK-001",
                                Instant.parse("2026-11-25T10:00:00Z"),
                                "CLOCK_OUT"
                        )
                )
        );

        mockMvc.perform(post("/api/v1/attendance/biometrics/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.importedCount", is(2)));

        mockMvc.perform(get("/api/v1/attendance/records")
                        .param("startDate", "2026-11-24")
                        .param("endDate", "2026-11-26")
                        .param("employeeId", employee.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].employeeNumber", is("EMP-CLK-001")));
    }
}
