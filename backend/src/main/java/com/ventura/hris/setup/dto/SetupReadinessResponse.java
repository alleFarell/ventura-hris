package com.ventura.hris.setup.dto;

import java.util.List;

public record SetupReadinessResponse(
        boolean ready,
        boolean hasActiveCompany,
        boolean hasActiveBranch,
        List<String> missingItems
) {
}
