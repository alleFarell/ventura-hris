CREATE TABLE offboarding_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    separation_type VARCHAR(50) NOT NULL,
    notice_date DATE NOT NULL,
    last_working_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offboarding_cases_employee ON offboarding_cases(employee_id);
CREATE INDEX idx_offboarding_cases_status ON offboarding_cases(status);

CREATE TABLE offboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES offboarding_cases(id) ON DELETE CASCADE,
    department_name VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
    cleared_by VARCHAR(150),
    cleared_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offboarding_checklists_case ON offboarding_checklists(case_id);
CREATE INDEX idx_offboarding_checklists_dept ON offboarding_checklists(department_name);

CREATE TABLE exit_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL UNIQUE REFERENCES offboarding_cases(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    primary_reason VARCHAR(100) NOT NULL,
    culture_rating INTEGER NOT NULL DEFAULT 5,
    management_rating INTEGER NOT NULL DEFAULT 5,
    feedback_text TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exit_interviews_case ON exit_interviews(case_id);
