package com.ventura.hris.common.api;

public record ApiErrorDetail(
        String field,
        String message
) {
}

