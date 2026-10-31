package com.ventura.hris.offboarding.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.offboarding.dto.ChecklistClearRequest;
import com.ventura.hris.offboarding.dto.OffboardingChecklistResponse;
import com.ventura.hris.offboarding.service.OffboardingChecklistService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offboarding/checklists")
public class OffboardingChecklistController {

    private final OffboardingChecklistService checklistService;

    public OffboardingChecklistController(OffboardingChecklistService checklistService) {
        this.checklistService = checklistService;
    }

    @GetMapping("/{caseId}")
    public ApiResponse<List<OffboardingChecklistResponse>> getChecklists(@PathVariable UUID caseId) {
        return ApiResponse.success(checklistService.getChecklists(caseId), "Offboarding checklists retrieved successfully");
    }

    @PutMapping("/{id}/clear")
    public ApiResponse<OffboardingChecklistResponse> clearItem(
            @PathVariable UUID id,
            @Valid @RequestBody ChecklistClearRequest request) {
        return ApiResponse.success(checklistService.clearItem(id, request), "Checklist item cleared successfully");
    }
}
