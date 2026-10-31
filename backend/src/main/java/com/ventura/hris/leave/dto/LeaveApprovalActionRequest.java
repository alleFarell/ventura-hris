package com.ventura.hris.leave.dto;

import jakarta.validation.constraints.Size;

public class LeaveApprovalActionRequest {

    @Size(max = 500, message = "Comments must not exceed 500 characters")
    private String comments;

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
