package com.ventura.hris.setup.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.api.PageMeta;
import com.ventura.hris.setup.dto.CompanyResponse;
import com.ventura.hris.setup.dto.CreateCompanyRequest;
import com.ventura.hris.setup.dto.UpdateCompanyRequest;
import com.ventura.hris.setup.service.CompanyService;
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
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    ApiResponse<List<CompanyResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "code") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<CompanyResponse> result = companyService.list(search, status, pageable(page, size, sort, direction));
        return ApiResponse.success(result.getContent(), "Companies loaded", PageMeta.from(result));
    }

    @GetMapping("/{id}")
    ApiResponse<CompanyResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(companyService.get(id), "Company loaded");
    }

    @PostMapping
    ResponseEntity<ApiResponse<CompanyResponse>> create(@Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(companyService.create(request), "Company created"));
    }

    @PutMapping("/{id}")
    ApiResponse<CompanyResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateCompanyRequest request) {
        return ApiResponse.success(companyService.update(id, request), "Company updated");
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    ApiResponse<Void> delete(@PathVariable UUID id) {
        companyService.delete(id);
        return ApiResponse.success(null, "Company deleted successfully");
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sort));
    }
}
