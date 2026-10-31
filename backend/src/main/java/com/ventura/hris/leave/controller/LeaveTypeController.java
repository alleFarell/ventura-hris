package com.ventura.hris.leave.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.leave.dto.LeaveTypeRequest;
import com.ventura.hris.leave.dto.LeaveTypeResponse;
import com.ventura.hris.leave.service.LeaveTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave/types")
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    public LeaveTypeController(LeaveTypeService leaveTypeService) {
        this.leaveTypeService = leaveTypeService;
    }

    @GetMapping
    public ApiResponse<List<LeaveTypeResponse>> getAllTypes() {
        List<LeaveTypeResponse> list = leaveTypeService.getAllLeaveTypes();
        return ApiResponse.success(list, "Leave types retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<LeaveTypeResponse> getTypeById(@PathVariable UUID id) {
        LeaveTypeResponse res = leaveTypeService.getLeaveTypeById(id);
        return ApiResponse.success(res, "Leave type details retrieved");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> createType(@Valid @RequestBody LeaveTypeRequest req) {
        LeaveTypeResponse created = leaveTypeService.createLeaveType(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Leave type created successfully"));
    }

    @PutMapping("/{id}")
    public ApiResponse<LeaveTypeResponse> updateType(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveTypeRequest req
    ) {
        LeaveTypeResponse updated = leaveTypeService.updateLeaveType(id, req);
        return ApiResponse.success(updated, "Leave type updated successfully");
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ApiResponse<Void> deleteType(@PathVariable UUID id) {
        leaveTypeService.deleteLeaveType(id);
        return ApiResponse.success(null, "Leave type deleted successfully");
    }
}
