package com.ventura.hris.organization.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.api.PageMeta;
import com.ventura.hris.organization.dto.CreatePositionRequest;
import com.ventura.hris.organization.dto.PositionResponse;
import com.ventura.hris.organization.dto.UpdatePositionRequest;
import com.ventura.hris.organization.service.PositionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/positions")
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @GetMapping
    public ApiResponse<List<PositionResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID divisionId,
            @RequestParam(required = false) UUID gradeId,
            @RequestParam(required = false) UUID jobLevelId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "code") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<PositionResponse> result = positionService.list(
                search, companyId, departmentId, divisionId, gradeId, jobLevelId, status,
                pageable(page, size, sort, direction)
        );
        return ApiResponse.success(result.getContent(), "Positions loaded", PageMeta.from(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<PositionResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(positionService.get(id), "Position loaded");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PositionResponse>> create(@Valid @RequestBody CreatePositionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(positionService.create(request), "Position created"));
    }

    @PutMapping("/{id}")
    public ApiResponse<PositionResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdatePositionRequest request) {
        return ApiResponse.success(positionService.update(id, request), "Position updated");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        positionService.delete(id);
        return ApiResponse.success(null, "Position deleted");
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sort));
    }
}
