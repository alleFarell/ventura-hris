package com.ventura.hris.leave;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.attendance.entity.CompanyHoliday;
import com.ventura.hris.attendance.repository.CompanyHolidayRepository;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.leave.dto.LeaveApprovalActionRequest;
import com.ventura.hris.leave.dto.LeaveBalanceAdjustRequest;
import com.ventura.hris.leave.dto.LeaveRequestCreateRequest;
import com.ventura.hris.leave.dto.LeaveTypeRequest;
import com.ventura.hris.leave.entity.LeaveType;
import com.ventura.hris.leave.repository.LeaveApprovalRepository;
import com.ventura.hris.leave.repository.LeaveBalanceRepository;
import com.ventura.hris.leave.repository.LeaveRequestRepository;
import com.ventura.hris.leave.repository.LeaveTypeRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LeaveManagementAndApprovalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveApprovalRepository leaveApprovalRepository;

    @Autowired
    private CompanyHolidayRepository holidayRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    private Company company;
    private Branch branch;
    private Employee employee;
    private Employee manager;
    private LeaveType annualLeave;
    private LeaveType sickLeave;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-LV1", "Leave Management Company", "PT Leave Solutions",
                "01.234.567.8-903.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        branch = new Branch(
                company, "BR-LV1", "Leave Branch", "Jl. Sudirman 100", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        manager = new Employee();
        manager.setCompany(company);
        manager.setBranch(branch);
        manager.setEmployeeNumber("MGR-001");
        manager.setFirstName("Sarah");
        manager.setLastName("Connor");
        manager.setWorkEmail("sarah.connor@ventura.local");
        manager.setEmploymentStatus(EmploymentStatus.ACTIVE);
        manager.setHireDate(LocalDate.of(2024, 1, 1));
        manager = employeeRepository.save(manager);

        employee = new Employee();
        employee.setCompany(company);
        employee.setBranch(branch);
        employee.setEmployeeNumber("EMP-LV-001");
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setWorkEmail("john.doe@ventura.local");
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.of(2025, 1, 1));
        employee = employeeRepository.save(employee);

        annualLeave = new LeaveType();
        annualLeave.setCode("ANNUAL");
        annualLeave.setName("Annual Leave");
        annualLeave.setDescription("Standard annual paid leave");
        annualLeave.setDefaultQuota(12);
        annualLeave.setIsPaid(true);
        annualLeave.setRequiresAttachment(false);
        annualLeave.setMaxConsecutiveDays(14);
        annualLeave.setCarryForwardAllowed(true);
        annualLeave.setMaxCarryForward(6);
        annualLeave.setIsActive(true);
        annualLeave = leaveTypeRepository.save(annualLeave);

        sickLeave = new LeaveType();
        sickLeave.setCode("SICK");
        sickLeave.setName("Sick Leave");
        sickLeave.setDescription("Medical absence leave");
        sickLeave.setDefaultQuota(14);
        sickLeave.setIsPaid(true);
        sickLeave.setRequiresAttachment(true);
        sickLeave.setMaxConsecutiveDays(30);
        sickLeave.setIsActive(true);
        sickLeave = leaveTypeRepository.save(sickLeave);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateAndRetrieveLeaveTypes() throws Exception {
        LeaveTypeRequest request = new LeaveTypeRequest();
        request.setCode("SPECIAL");
        request.setName("Special Project Leave");
        request.setDescription("Reward leave for project milestones");
        request.setDefaultQuota(5);
        request.setIsPaid(true);
        request.setRequiresAttachment(false);
        request.setMaxConsecutiveDays(5);
        request.setIsActive(true);

        mockMvc.perform(post("/api/v1/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("SPECIAL"))
                .andExpect(jsonPath("$.data.defaultQuota").value(5));

        mockMvc.perform(get("/api/v1/leave/types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testEmployeeLeaveBalancesAndAdjustment() throws Exception {
        // Initial query should auto-initialize balances from active leave types
        mockMvc.perform(get("/api/v1/leave/balances/employee/" + employee.getId())
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].remainingQuota").value(12))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].totalQuota").value(12));

        // Adjust quota (e.g. +3 bonus days)
        LeaveBalanceAdjustRequest adjust = new LeaveBalanceAdjustRequest();
        adjust.setEmployeeId(employee.getId());
        adjust.setLeaveTypeId(annualLeave.getId());
        adjust.setYear(2026);
        adjust.setTotalQuota(15);
        adjust.setCarriedOver(2);

        mockMvc.perform(post("/api/v1/leave/balances/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adjust)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalQuota").value(15))
                .andExpect(jsonPath("$.data.carriedOver").value(2))
                .andExpect(jsonPath("$.data.remainingQuota").value(17));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testLeaveRequestSubmissionAndWorkingDayExclusion() throws Exception {
        // Seed a public holiday on Tuesday 2026-10-06
        CompanyHoliday holiday = new CompanyHoliday();
        holiday.setCompanyId(company.getId());
        holiday.setHolidayDate(LocalDate.of(2026, 10, 6));
        holiday.setName("National Special Holiday");
        holiday.setIsMandatory(true);
        holidayRepository.save(holiday);

        // Period: Monday 2026-10-05 to Thursday 2026-10-08 (4 calendar days, but Tuesday is holiday -> 3 working days)
        LeaveRequestCreateRequest req = new LeaveRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setLeaveTypeId(annualLeave.getId());
        req.setStartDate(LocalDate.of(2026, 10, 5));
        req.setEndDate(LocalDate.of(2026, 10, 8));
        req.setReason("Family Vacation");
        req.setApproverId(manager.getId());

        mockMvc.perform(post("/api/v1/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDays").value(3))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.approvals", hasSize(1)))
                .andExpect(jsonPath("$.data.approvals[0].approverName").value("Sarah Connor"));

        // Verify balance pending updated to 3 and remaining is 9
        mockMvc.perform(get("/api/v1/leave/balances/employee/" + employee.getId())
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].pending").value(3))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].remainingQuota").value(9));

        // Attempting overlapping leave request should fail
        LeaveRequestCreateRequest overlap = new LeaveRequestCreateRequest();
        overlap.setEmployeeId(employee.getId());
        overlap.setLeaveTypeId(annualLeave.getId());
        overlap.setStartDate(LocalDate.of(2026, 10, 7));
        overlap.setEndDate(LocalDate.of(2026, 10, 9));
        overlap.setReason("Conflicting request");

        mockMvc.perform(post("/api/v1/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overlap)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("OVERLAPPING_LEAVE_REQUEST"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testInsufficientQuotaRejection() throws Exception {
        // Request 13 working days (Monday 2026-11-02 to Wednesday 2026-11-18 is 13 working days: <= 14 max consecutive days, but > 12 quota)
        LeaveRequestCreateRequest req = new LeaveRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setLeaveTypeId(annualLeave.getId());
        req.setStartDate(LocalDate.of(2026, 11, 2));
        req.setEndDate(LocalDate.of(2026, 11, 18));
        req.setReason("Leave exceeding 12 days quota");

        mockMvc.perform(post("/api/v1/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INSUFFICIENT_LEAVE_QUOTA"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testApprovalChainWorkflowAndBalanceDeduction() throws Exception {
        // Submit request for 2 working days (Monday-Tuesday)
        LeaveRequestCreateRequest req = new LeaveRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setLeaveTypeId(annualLeave.getId());
        req.setStartDate(LocalDate.of(2026, 12, 7));
        req.setEndDate(LocalDate.of(2026, 12, 8));
        req.setReason("Doctor visit & rest");
        req.setApproverId(manager.getId());

        String resJson = mockMvc.perform(post("/api/v1/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String approvalId = objectMapper.readTree(resJson).path("data").path("approvals").get(0).path("id").asText();

        // Check manager inbox
        mockMvc.perform(get("/api/v1/leave/approvals/inbox")
                        .param("approverId", manager.getId().toString())
                        .param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(approvalId));

        // Manager approves
        LeaveApprovalActionRequest action = new LeaveApprovalActionRequest();
        action.setComments("Approved, take care!");

        mockMvc.perform(post("/api/v1/leave/approvals/" + approvalId + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.approvals[0].status").value("APPROVED"))
                .andExpect(jsonPath("$.data.approvals[0].comments").value("Approved, take care!"));

        // Verify balance: pending should be 0, used should be 2, remaining should be 10
        mockMvc.perform(get("/api/v1/leave/balances/employee/" + employee.getId())
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].pending").value(0))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].used").value(2))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].remainingQuota").value(10));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testRejectionAndBalanceRestoration() throws Exception {
        // Submit request for 3 working days (Wednesday to Friday)
        LeaveRequestCreateRequest req = new LeaveRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setLeaveTypeId(annualLeave.getId());
        req.setStartDate(LocalDate.of(2026, 12, 9));
        req.setEndDate(LocalDate.of(2026, 12, 11));
        req.setReason("Urgent personal event");
        req.setApproverId(manager.getId());

        String resJson = mockMvc.perform(post("/api/v1/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String approvalId = objectMapper.readTree(resJson).path("data").path("approvals").get(0).path("id").asText();

        // Manager rejects
        LeaveApprovalActionRequest action = new LeaveApprovalActionRequest();
        action.setComments("Unable to approve due to critical sprint deadline.");

        mockMvc.perform(post("/api/v1/leave/approvals/" + approvalId + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.approvals[0].status").value("REJECTED"));

        // Verify balance: pending restored to 0, remaining restored to 12
        mockMvc.perform(get("/api/v1/leave/balances/employee/" + employee.getId())
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].pending").value(0))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].remainingQuota").value(12));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCancellationAndBalanceRestoration() throws Exception {
        // Submit request
        LeaveRequestCreateRequest req = new LeaveRequestCreateRequest();
        req.setEmployeeId(employee.getId());
        req.setLeaveTypeId(annualLeave.getId());
        req.setStartDate(LocalDate.of(2026, 12, 14));
        req.setEndDate(LocalDate.of(2026, 12, 15));
        req.setReason("Personal plan");
        req.setApproverId(manager.getId());

        String resJson = mockMvc.perform(post("/api/v1/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(resJson).path("data").path("id").asText();

        // Pending balance is 2
        mockMvc.perform(get("/api/v1/leave/balances/employee/" + employee.getId())
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].pending").value(2));

        // Employee cancels request
        mockMvc.perform(put("/api/v1/leave/requests/" + requestId + "/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        // Pending balance restored to 0
        mockMvc.perform(get("/api/v1/leave/balances/employee/" + employee.getId())
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].pending").value(0))
                .andExpect(jsonPath("$.data[?(@.leaveTypeCode == 'ANNUAL')].remainingQuota").value(12));
    }
}
