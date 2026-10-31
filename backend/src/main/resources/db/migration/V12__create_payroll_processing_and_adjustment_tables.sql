-- V12__create_payroll_processing_and_adjustment_tables.sql
-- Sprint 11: Payroll Processing Engine, Deductions, Loans & Reimbursements

CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES payroll_periods(id),
    run_number VARCHAR(50) NOT NULL UNIQUE,
    execution_date DATE NOT NULL,
    total_gross_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_net_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_employees INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_run_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    basic_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    prorated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    allowances_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    overtime_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reimbursement_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    attendance_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    loan_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    line_items_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_payroll_run_item UNIQUE (payroll_run_id, employee_id)
);

CREATE TABLE IF NOT EXISTS employee_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    loan_number VARCHAR(50) NOT NULL UNIQUE,
    loan_amount NUMERIC(15, 2) NOT NULL,
    installment_count INT NOT NULL,
    monthly_installment NUMERIC(15, 2) NOT NULL,
    remaining_balance NUMERIC(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_loan_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES employee_loans(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES payroll_runs(id),
    installment_number INT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    payroll_run_id UUID REFERENCES payroll_runs(id),
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    receipt_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_run_items_emp ON payroll_run_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_loans_emp ON employee_loans(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_reimbursements_emp ON employee_reimbursements(employee_id);
