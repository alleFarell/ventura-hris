package com.ventura.hris.setup.entity;

import com.ventura.hris.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "companies")
public class Company extends AuditableEntity {

    @Column(nullable = false, length = 30, unique = true)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "legal_name", nullable = false, length = 200)
    private String legalName;

    @Column(name = "tax_identifier", length = 80)
    private String taxIdentifier;

    @Column(name = "default_locale", nullable = false, length = 20)
    private String defaultLocale;

    @Column(name = "default_timezone", nullable = false, length = 80)
    private String defaultTimezone;

    @Column(name = "default_currency", nullable = false, length = 3)
    private String defaultCurrency;

    @Column(name = "default_date_format", nullable = false, length = 30)
    private String defaultDateFormat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecordStatus status;

    protected Company() {
    }

    public Company(String code, String name, String legalName, String taxIdentifier, String defaultLocale,
                   String defaultTimezone, String defaultCurrency, String defaultDateFormat, RecordStatus status) {
        this.code = normalizeCode(code);
        this.name = name;
        this.legalName = legalName;
        this.taxIdentifier = taxIdentifier;
        this.defaultLocale = defaultLocale;
        this.defaultTimezone = defaultTimezone;
        this.defaultCurrency = normalizeCode(defaultCurrency);
        this.defaultDateFormat = defaultDateFormat;
        this.status = status;
    }

    public void update(String name, String legalName, String taxIdentifier, String defaultLocale,
                       String defaultTimezone, String defaultCurrency, String defaultDateFormat, RecordStatus status) {
        this.name = name;
        this.legalName = legalName;
        this.taxIdentifier = taxIdentifier;
        this.defaultLocale = defaultLocale;
        this.defaultTimezone = defaultTimezone;
        this.defaultCurrency = normalizeCode(defaultCurrency);
        this.defaultDateFormat = defaultDateFormat;
        this.status = status;
    }

    private String normalizeCode(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getLegalName() {
        return legalName;
    }

    public String getTaxIdentifier() {
        return taxIdentifier;
    }

    public String getDefaultLocale() {
        return defaultLocale;
    }

    public String getDefaultTimezone() {
        return defaultTimezone;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public String getDefaultDateFormat() {
        return defaultDateFormat;
    }

    public RecordStatus getStatus() {
        return status;
    }
}
