package com.ventura.hris.security.service;

import com.ventura.hris.audit.service.AuditLogService;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.notification.service.NotificationService;
import com.ventura.hris.security.dto.CreateRoleRequest;
import com.ventura.hris.security.dto.CreateUserRequest;
import com.ventura.hris.security.dto.PermissionResponse;
import com.ventura.hris.security.dto.RoleResponse;
import com.ventura.hris.security.dto.UpdateRoleRequest;
import com.ventura.hris.security.dto.UpdateUserRolesRequest;
import com.ventura.hris.security.dto.UpdateUserStatusRequest;
import com.ventura.hris.security.dto.UserSummaryResponse;
import com.ventura.hris.security.entity.Permission;
import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.repository.PermissionRepository;
import com.ventura.hris.security.repository.RoleRepository;
import com.ventura.hris.security.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class RbacService {

    private static final Set<String> IMMUTABLE_SYSTEM_ROLES = Set.of(
            "ROLE_SUPER_ADMIN",
            "ROLE_HR_ADMIN",
            "ROLE_MANAGER",
            "ROLE_EMPLOYEE"
    );

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    public RbacService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRepository userRepository,
            AuditLogService auditLogService,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    // ==================== PERMISSIONS ====================

    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAllByOrderByCategoryAscCodeAsc()
                .stream()
                .map(PermissionResponse::fromEntity)
                .toList();
    }

    // ==================== ROLES ====================

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAllByOrderByCodeAsc()
                .stream()
                .map(RoleResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleById(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        return RoleResponse.fromEntity(role);
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        String code = request.code().trim().toUpperCase();
        if (!code.startsWith("ROLE_")) {
            code = "ROLE_" + code;
        }

        if (roleRepository.existsByCodeIgnoreCase(code)) {
            throw new DomainException("ROLE_EXISTS", "A role with code " + code + " already exists");
        }

        Role role = new Role(code, request.name().trim(), request.description() != null ? request.description().trim() : null);

        if (request.permissionIds() != null && !request.permissionIds().isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllById(request.permissionIds());
            role.setPermissions(new HashSet<>(permissions));
        }

        Role savedRole = roleRepository.save(role);

        auditLogService.log(
                null,
                getCurrentUsername(),
                "CREATE",
                "ROLE",
                savedRole.getId().toString(),
                "Created role " + savedRole.getCode(),
                null
        );

        return RoleResponse.fromEntity(savedRole);
    }

    @Transactional
    public RoleResponse updateRole(UUID roleId, UpdateRoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        role.setName(request.name().trim());
        role.setDescription(request.description() != null ? request.description().trim() : null);
        role.setUpdatedAt(Instant.now());

        if (request.permissionIds() != null) {
            List<Permission> permissions = permissionRepository.findAllById(request.permissionIds());
            role.setPermissions(new HashSet<>(permissions));
        }

        Role updatedRole = roleRepository.save(role);

        auditLogService.log(
                null,
                getCurrentUsername(),
                "UPDATE",
                "ROLE",
                updatedRole.getId().toString(),
                "Updated role " + updatedRole.getCode(),
                null
        );

        return RoleResponse.fromEntity(updatedRole);
    }

    @Transactional
    public void deleteRole(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (IMMUTABLE_SYSTEM_ROLES.contains(role.getCode().toUpperCase())) {
            throw new DomainException("SYSTEM_ROLE_IMMUTABLE", "Built-in system role " + role.getCode() + " cannot be deleted");
        }

        roleRepository.delete(role);

        auditLogService.log(
                null,
                getCurrentUsername(),
                "DELETE",
                "ROLE",
                roleId.toString(),
                "Deleted role " + role.getCode(),
                null
        );
    }

    // ==================== USER MANAGEMENT ====================

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAllByDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(UserSummaryResponse::fromEntity)
                .toList();
    }

    @Transactional
    public UserSummaryResponse createUser(CreateUserRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new DomainException("USER_EXISTS", "Username " + username + " is already taken");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DomainException("EMAIL_EXISTS", "Email " + email + " is already registered");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setStatus("ACTIVE");

        Set<Role> roles = new HashSet<>();
        if (request.roleCodes() != null && !request.roleCodes().isEmpty()) {
            for (String code : request.roleCodes()) {
                roleRepository.findByCodeIgnoreCase(code.trim()).ifPresent(roles::add);
            }
        }
        if (roles.isEmpty()) {
            roleRepository.findByCodeIgnoreCase("ROLE_EMPLOYEE").ifPresent(roles::add);
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        auditLogService.log(
                savedUser.getId(),
                getCurrentUsername(),
                "CREATE",
                "USER",
                savedUser.getId().toString(),
                "Created user account: " + savedUser.getUsername(),
                null
        );

        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to Ventura HRIS",
                "Hello " + savedUser.getFullName() + ", your account has been successfully created.",
                "SYSTEM"
        );

        return UserSummaryResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserSummaryResponse updateUserRoles(UUID userId, UpdateUserRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<Role> newRoles = new HashSet<>();
        for (String code : request.roleCodes()) {
            Role r = roleRepository.findByCodeIgnoreCase(code.trim())
                    .orElseThrow(() -> new DomainException("ROLE_NOT_FOUND", "Role not found: " + code));
            newRoles.add(r);
        }

        user.setRoles(newRoles);
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);

        auditLogService.log(
                updatedUser.getId(),
                getCurrentUsername(),
                "ASSIGN_ROLE",
                "USER",
                updatedUser.getId().toString(),
                "Updated roles for user " + updatedUser.getUsername(),
                null
        );

        notificationService.createNotification(
                updatedUser.getId(),
                "Security Roles Updated",
                "Your role permissions have been updated.",
                "SECURITY"
        );

        return UserSummaryResponse.fromEntity(updatedUser);
    }

    @Transactional
    public UserSummaryResponse updateUserStatus(UUID userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setStatus(request.status().trim().toUpperCase());
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);

        auditLogService.log(
                updatedUser.getId(),
                getCurrentUsername(),
                "STATUS_CHANGE",
                "USER",
                updatedUser.getId().toString(),
                "Changed user status to " + updatedUser.getStatus(),
                null
        );

        return UserSummaryResponse.fromEntity(updatedUser);
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }
}
