package com.ventura.hris.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.security.dto.CreateRoleRequest;
import com.ventura.hris.security.dto.CreateUserRequest;
import com.ventura.hris.security.dto.UpdateUserRolesRequest;
import com.ventura.hris.security.dto.UpdateUserStatusRequest;
import com.ventura.hris.security.entity.Permission;
import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.repository.PermissionRepository;
import com.ventura.hris.security.repository.RoleRepository;
import com.ventura.hris.security.repository.UserRepository;
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

import java.util.Set;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RbacAndRoleManagementTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        // Seed core roles for test isolation
        roleRepository.save(new Role("ROLE_SUPER_ADMIN", "Super Administrator", "Full access"));
        roleRepository.save(new Role("ROLE_HR_ADMIN", "HR Administrator", "HR access"));
        roleRepository.save(new Role("ROLE_EMPLOYEE", "Employee", "Self-service access"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldListPermissions() throws Exception {
        mockMvc.perform(get("/api/v1/permissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldCreateCustomRoleWithPermissions() throws Exception {
        Permission perm = permissionRepository.findByCodeIgnoreCase("AUDIT_READ")
                .orElseGet(() -> permissionRepository.save(new Permission("AUDIT_READ", "Audit Read", "AUDIT", "Read audit logs")));

        CreateRoleRequest request = new CreateRoleRequest(
                "COMPLIANCE_OFFICER",
                "Compliance Officer",
                "Monitors regulatory compliance",
                Set.of(perm.getId())
        );

        mockMvc.perform(post("/api/v1/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("ROLE_COMPLIANCE_OFFICER")))
                .andExpect(jsonPath("$.data.name", is("Compliance Officer")))
                .andExpect(jsonPath("$.data.permissions", hasSize(1)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldRejectDuplicateRoleCode() throws Exception {
        CreateRoleRequest request = new CreateRoleRequest(
                "HR_ADMIN", // Will resolve to ROLE_HR_ADMIN which is already seeded
                "Another HR Admin",
                "Duplicate role",
                Set.of()
        );

        mockMvc.perform(post("/api/v1/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("ROLE_EXISTS")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldPreventDeletionOfSystemRole() throws Exception {
        Role superAdminRole = roleRepository.findByCodeIgnoreCase("ROLE_SUPER_ADMIN").orElseThrow();

        mockMvc.perform(delete("/api/v1/roles/" + superAdminRole.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("SYSTEM_ROLE_IMMUTABLE")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SUPER_ADMIN"})
    void shouldManageUserRolesAndStatus() throws Exception {
        // 1. Create user
        CreateUserRequest createReq = new CreateUserRequest(
                "johndoe",
                "john.doe@ventura.test",
                "Secret@123",
                "John Doe",
                Set.of("ROLE_EMPLOYEE")
        );

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.username", is("johndoe")))
                .andExpect(jsonPath("$.data.roles", hasItem("ROLE_EMPLOYEE")));

        User user = userRepository.findByUsernameIgnoreCase("johndoe").orElseThrow();

        // 2. Update user roles to include ROLE_HR_ADMIN
        UpdateUserRolesRequest rolesReq = new UpdateUserRolesRequest(Set.of("ROLE_EMPLOYEE", "ROLE_HR_ADMIN"));
        mockMvc.perform(put("/api/v1/users/" + user.getId() + "/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rolesReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.roles", hasItem("ROLE_HR_ADMIN")));

        // 3. Suspend user
        UpdateUserStatusRequest statusReq = new UpdateUserStatusRequest("SUSPENDED");
        mockMvc.perform(put("/api/v1/users/" + user.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUSPENDED")));
    }
}
