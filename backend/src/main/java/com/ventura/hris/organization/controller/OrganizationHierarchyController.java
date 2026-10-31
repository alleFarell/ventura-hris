package com.ventura.hris.organization.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.organization.dto.MoveOrganizationUnitRequest;
import com.ventura.hris.organization.dto.OrganizationTreeNodeResponse;
import com.ventura.hris.organization.dto.OrganizationUnitResponse;
import com.ventura.hris.organization.dto.StructureHistoryResponse;
import com.ventura.hris.organization.service.OrganizationHierarchyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organization-units")
public class OrganizationHierarchyController {

    private final OrganizationHierarchyService hierarchyService;

    public OrganizationHierarchyController(OrganizationHierarchyService hierarchyService) {
        this.hierarchyService = hierarchyService;
    }

    @GetMapping("/tree")
    public ApiResponse<List<OrganizationTreeNodeResponse>> getTree(@RequestParam UUID companyId) {
        return ApiResponse.success(hierarchyService.getHierarchyTree(companyId), "Organization tree loaded");
    }

    @GetMapping
    public ApiResponse<List<OrganizationUnitResponse>> list(@RequestParam UUID companyId) {
        return ApiResponse.success(hierarchyService.listUnits(companyId), "Organization units loaded");
    }

    @GetMapping("/{id}")
    public ApiResponse<OrganizationUnitResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(hierarchyService.getUnit(id), "Organization unit loaded");
    }

    @PutMapping("/{id}/parent")
    public ApiResponse<OrganizationUnitResponse> moveParent(
            @PathVariable UUID id,
            @Valid @RequestBody MoveOrganizationUnitRequest request
    ) {
        return ApiResponse.success(hierarchyService.moveParent(id, request), "Organization unit moved");
    }

    @GetMapping("/{id}/history")
    public ApiResponse<List<StructureHistoryResponse>> getHistory(@PathVariable UUID id) {
        return ApiResponse.success(hierarchyService.getUnitHistory(id), "Structure history loaded");
    }
}
