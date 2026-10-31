package com.ventura.hris.security.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.security.dto.CreateRoleRequest;
import com.ventura.hris.security.dto.CreateUserRequest;
import com.ventura.hris.security.dto.PermissionResponse;
import com.ventura.hris.security.dto.RoleResponse;
import com.ventura.hris.security.dto.UpdateRoleRequest;
import com.ventura.hris.security.dto.UpdateUserRolesRequest;
import com.ventura.hris.security.dto.UpdateUserStatusRequest;
import com.ventura.hris.security.dto.UserSummaryResponse;
import com.ventura.hris.security.service.RbacService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class RbacController {

    private final RbacService rbacService;

    public RbacController(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    // ==================== PERMISSIONS ====================

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getPermissions() {
        List<PermissionResponse> permissions = rbacService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.success(permissions, "Permissions retrieved successfully"));
    }

    // ==================== ROLES ====================

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getRoles() {
        List<RoleResponse> roles = rbacService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles, "Roles retrieved successfully"));
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable("id") UUID id) {
        RoleResponse role = rbacService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success(role, "Role retrieved successfully"));
    }

    @PostMapping("/roles")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleResponse role = rbacService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(role, "Role created successfully"));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        RoleResponse role = rbacService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.success(role, "Role updated successfully"));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable("id") UUID id) {
        rbacService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Role deleted successfully"));
    }

    // ==================== USERS ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getUsers() {
        List<UserSummaryResponse> users = rbacService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserSummaryResponse user = rbacService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User created successfully"));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserRoles(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateUserRolesRequest request
    ) {
        UserSummaryResponse user = rbacService.updateUserRoles(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User roles updated successfully"));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UserSummaryResponse user = rbacService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User status updated successfully"));
    }
}
