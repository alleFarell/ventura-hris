-- V14__create_benefits_and_social_security_tables.sql
-- Sprint 13: Benefits Administration, Social Security (BPJS / National Schemes)

CREATE TABLE IF NOT EXISTS bpjs_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_type VARCHAR(50) NOT NULL UNIQUE,
    employer_rate NUMERIC(6, 4) NOT NULL,
    employee_rate NUMERIC(6, 4) NOT NULL,
    wage_ceiling NUMERIC(15, 2),
    wage_floor NUMERIC(15, 2),
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_bpjs_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bpjs_kes_number VARCHAR(50),
    bpjs_tk_number VARCHAR(50),
    jkk_risk_grade INT NOT NULL DEFAULT 1,
    is_kes_active BOOLEAN NOT NULL DEFAULT true,
    is_tk_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_bpjs UNIQUE (employee_id)
);

CREATE TABLE IF NOT EXISTS benefit_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    annual_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_benefit_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    benefit_plan_id UUID NOT NULL REFERENCES benefit_plans(id) ON DELETE CASCADE,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    claim_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    receipt_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    reviewed_by UUID REFERENCES employees(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bpjs_enrollment_emp ON employee_bpjs_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_benefit_claims_emp ON employee_benefit_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_benefit_claims_plan ON employee_benefit_claims(benefit_plan_id);

-- Seed Indonesian Statutory BPJS Configurations
INSERT INTO bpjs_configurations (program_type, employer_rate, employee_rate, wage_ceiling, description)
VALUES
    ('BPJS_KESEHATAN', 0.0400, 0.0100, 12000000.00, 'BPJS Kesehatan standard rate (4% employer, 1% employee, cap 12M)'),
    ('BPJS_TK_JKK', 0.0024, 0.0000, NULL, 'BPJS Ketenagakerjaan Jaminan Kecelakaan Kerja (0.24% default risk grade 1)'),
    ('BPJS_TK_JKM', 0.0030, 0.0000, NULL, 'BPJS Ketenagakerjaan Jaminan Kematian (0.30% employer)'),
    ('BPJS_TK_JHT', 0.0370, 0.0200, NULL, 'BPJS Ketenagakerjaan Jaminan Hari Tua (3.7% employer, 2.0% employee)'),
    ('BPJS_TK_JP', 0.0200, 0.0100, 10042300.00, 'BPJS Ketenagakerjaan Jaminan Pensiun (2% employer, 1% employee, cap 10.04M)');
