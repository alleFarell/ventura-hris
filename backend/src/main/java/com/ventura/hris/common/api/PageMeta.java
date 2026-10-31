package com.ventura.hris.common.api;

import org.springframework.data.domain.Page;

import java.util.Map;

public final class PageMeta {

    private PageMeta() {
    }

    public static Map<String, Object> from(Page<?> page) {
        return Map.of(
                "page", page.getNumber(),
                "size", page.getSize(),
                "totalElements", page.getTotalElements(),
                "totalPages", page.getTotalPages()
        );
    }
}
