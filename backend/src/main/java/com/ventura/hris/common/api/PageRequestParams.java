package com.ventura.hris.common.api;

public record PageRequestParams(
        int page,
        int size,
        String sort,
        String direction
) {
}

