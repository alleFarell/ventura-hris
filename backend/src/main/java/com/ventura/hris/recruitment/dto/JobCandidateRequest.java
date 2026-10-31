package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record JobCandidateRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    String phone,
    String resumeUrl,
    String linkedinUrl,
    String portfolioUrl
) {}
