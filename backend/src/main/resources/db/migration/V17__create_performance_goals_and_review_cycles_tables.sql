-- V17: Create Performance Goals and Review Cycles Tables
CREATE TABLE IF NOT EXISTS performance_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    cycle_type VARCHAR(30) NOT NULL, -- ANNUAL, SEMI_ANNUAL, QUARTERLY
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    self_review_deadline DATE NOT NULL,
    manager_review_deadline DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED', -- PLANNED, ACTIVE, EVALUATION, CLOSED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perf_cycles_company ON performance_cycles(company_id);
CREATE INDEX IF NOT EXISTS idx_perf_cycles_status ON performance_cycles(status);

CREATE TABLE IF NOT EXISTS performance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL DEFAULT 'INDIVIDUAL', -- INDIVIDUAL, DEPARTMENT, COMPANY
    weight INT NOT NULL DEFAULT 100,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- DRAFT, ACTIVE, COMPLETED, CANCELLED
    progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perf_goals_cycle ON performance_goals(cycle_id);
CREATE INDEX IF NOT EXISTS idx_perf_goals_employee ON performance_goals(employee_id);

CREATE TABLE IF NOT EXISTS performance_goal_key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES performance_goals(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    metric_type VARCHAR(30) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, NUMBER, CURRENCY, BOOLEAN
    target_value NUMERIC(15, 2) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perf_kr_goal ON performance_goal_key_results(goal_id);
