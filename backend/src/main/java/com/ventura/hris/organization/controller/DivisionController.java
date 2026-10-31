package com.ventura.hris.organization.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.api.PageMeta;
import com.ventura.hris.organization.dto.CreateDivisionRequest;
import com.ventura.hris.organization.dto.DivisionResponse;
import com.ventura.hris.organization.dto.UpdateDivisionRequest;
import com.ventura.hris.organization.service.DivisionService;
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
@RequestMapping("/api/v1/divisions")
public class DivisionController {

    private final DivisionService divisionService;

    public DivisionController(DivisionService divisionService) {
        this.divisionService = divisionService;
    }

    @GetMapping
    public ApiResponse<List<DivisionResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "code") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<DivisionResponse> result = divisionService.list(search, companyId, departmentId, status, pageable(page, size, sort, direction));
        return ApiResponse.success(result.getContent(), "Divisions loaded", PageMeta.from(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<DivisionResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(divisionService.get(id), "Division loaded");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DivisionResponse>> create(@Valid @RequestBody CreateDivisionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(divisionService.create(request), "Division created"));
    }

    @PutMapping("/{id}")
    public ApiResponse<DivisionResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateDivisionRequest request) {
        return ApiResponse.success(divisionService.update(id, request), "Division updated");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        divisionService.delete(id);
        return ApiResponse.success(null, "Division deleted");
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sort));
    }
}
