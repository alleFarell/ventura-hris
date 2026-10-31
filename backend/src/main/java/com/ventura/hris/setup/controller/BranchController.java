package com.ventura.hris.setup.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.api.PageMeta;
import com.ventura.hris.setup.dto.BranchResponse;
import com.ventura.hris.setup.dto.CreateBranchRequest;
import com.ventura.hris.setup.dto.UpdateBranchRequest;
import com.ventura.hris.setup.service.BranchService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/v1/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping
    ApiResponse<List<BranchResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "code") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<BranchResponse> result = branchService.list(search, companyId, status, pageable(page, size, sort, direction));
        return ApiResponse.success(result.getContent(), "Branches loaded", PageMeta.from(result));
    }

    @GetMapping("/{id}")
    ApiResponse<BranchResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(branchService.get(id), "Branch loaded");
    }

    @PostMapping
    ResponseEntity<ApiResponse<BranchResponse>> create(@Valid @RequestBody CreateBranchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(branchService.create(request), "Branch created"));
    }

    @PutMapping("/{id}")
    ApiResponse<BranchResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateBranchRequest request) {
        return ApiResponse.success(branchService.update(id, request), "Branch updated");
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    ApiResponse<Void> delete(@PathVariable UUID id) {
        branchService.delete(id);
        return ApiResponse.success(null, "Branch deleted successfully");
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sort));
    }
}
