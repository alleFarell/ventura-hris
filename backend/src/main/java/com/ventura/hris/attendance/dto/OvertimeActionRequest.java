package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.Size;

public class OvertimeActionRequest {

    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comments;

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
