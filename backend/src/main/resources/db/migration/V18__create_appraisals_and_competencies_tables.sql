-- V18: Create Appraisals, Competencies, and 360 Feedback Tables
CREATE TABLE IF NOT EXISTS competency_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'CORE', -- CORE, LEADERSHIP, FUNCTIONAL
    description TEXT,
    weight INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_competency_code UNIQUE (company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_competencies_company ON competency_models(company_id);

CREATE TABLE IF NOT EXISTS employee_appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    self_score NUMERIC(4, 2),
    manager_score NUMERIC(4, 2),
    final_score NUMERIC(4, 2),
    performance_grade VARCHAR(10), -- A, B, C, D
    status VARCHAR(30) NOT NULL DEFAULT 'SELF_REVIEW', -- SELF_REVIEW, MANAGER_REVIEW, CALIBRATION, COMPLETED
    self_comments TEXT,
    manager_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_appraisal_cycle_employee UNIQUE (cycle_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_appraisals_cycle ON employee_appraisals(cycle_id);
CREATE INDEX IF NOT EXISTS idx_appraisals_employee ON employee_appraisals(employee_id);

CREATE TABLE IF NOT EXISTS appraisal_360_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appraisal_id UUID NOT NULL REFERENCES employee_appraisals(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    relationship VARCHAR(50) NOT NULL DEFAULT 'PEER', -- PEER, SUBORDINATE, CROSS_FUNCTIONAL
    rating NUMERIC(4, 2),
    feedback_text TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, SUBMITTED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_appraisal ON appraisal_360_feedback(appraisal_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer ON appraisal_360_feedback(reviewer_id);
