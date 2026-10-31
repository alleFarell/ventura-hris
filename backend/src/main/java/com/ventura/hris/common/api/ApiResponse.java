package com.ventura.hris.common.api;

import java.util.Map;

public record ApiResponse<T>(
        boolean success,
        T data,
        String message,
        Map<String, Object> meta,
        ApiError error
) {
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, Map.of(), null);
    }

    public static <T> ApiResponse<T> success(T data, String message, Map<String, Object> meta) {
        return new ApiResponse<>(true, data, message, meta, null);
    }

    public static <T> ApiResponse<T> failure(ApiError error) {
        return new ApiResponse<>(false, null, null, Map.of(), error);
    }
}
