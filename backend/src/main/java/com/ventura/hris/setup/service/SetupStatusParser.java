package com.ventura.hris.setup.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.setup.entity.RecordStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
class SetupStatusParser {

    RecordStatus parseOrDefault(String rawStatus, RecordStatus defaultStatus) {
        if (!StringUtils.hasText(rawStatus)) {
            return defaultStatus;
        }

        try {
            return RecordStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new DomainException("SETUP_STATUS_INVALID", "Status must be draft, active, or inactive", HttpStatus.BAD_REQUEST);
        }
    }

    RecordStatus parseOptional(String rawStatus) {
        if (!StringUtils.hasText(rawStatus)) {
            return null;
        }
        return parseOrDefault(rawStatus, null);
    }
}
