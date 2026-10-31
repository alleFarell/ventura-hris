package com.ventura.hris.organization.dto;

import java.util.List;
import java.util.UUID;

public record OrganizationTreeNodeResponse(
        UUID id,
        UUID companyId,
        UUID parentUnitId,
        UUID departmentId,
        UUID divisionId,
        UUID positionId,
        String code,
        String name,
        String unitType,
        String status,
        List<OrganizationTreeNodeResponse> children
) {
}
