package com.ventura.hris.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String resource) {
        super("RESOURCE_NOT_FOUND", resource + " was not found", HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String resource, Object id) {
        super("RESOURCE_NOT_FOUND", resource + " with id " + id + " was not found", HttpStatus.NOT_FOUND);
    }
}
