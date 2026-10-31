package com.ventura.hris.audit;

import com.ventura.hris.audit.service.AuditLogService;
import com.ventura.hris.util.TestDatabaseCleaner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuditLogAndGovernanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        cleaner.clean();
    }

    @Test
    @WithMockUser(username = "auditor", roles = {"SUPER_ADMIN"})
    void shouldLogAndQueryAuditEvents() throws Exception {
        UUID entityId = UUID.randomUUID();

        // 1. Log two audit records
        auditLogService.log(
                null,
                "admin",
                "CREATE",
                "COMPANY",
                entityId.toString(),
                "Created test tenant company",
                "127.0.0.1"
        );

        auditLogService.log(
                null,
                "hr_user",
                "UPDATE",
                "EMPLOYEE",
                UUID.randomUUID().toString(),
                "Updated salary grade assignment",
                "192.168.1.10"
        );

        // 2. Query all audit logs
        mockMvc.perform(get("/api/v1/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.length()", is(2)));

        // 3. Query filtered by entityType
        mockMvc.perform(get("/api/v1/audit-logs")
                        .param("entityType", "COMPANY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.length()", is(1)))
                .andExpect(jsonPath("$.data[0].entityType", is("COMPANY")))
                .andExpect(jsonPath("$.data[0].action", is("CREATE")));
    }
}
