-- V13__create_payslip_and_disbursal_tables.sql
-- Sprint 12: Payslip Generation, Bank Transfer Disbursal Formats & Reporting

CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_item_id UUID NOT NULL REFERENCES payroll_run_items(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    payslip_number VARCHAR(50) NOT NULL UNIQUE,
    period_name VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    gross_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payslip_data_json TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_disbursal_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    bank_code VARCHAR(30) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_records INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    file_content TEXT,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_disbursal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES bank_disbursal_batches(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_run_item ON payslips(payroll_run_item_id);
CREATE INDEX IF NOT EXISTS idx_bank_disbursal_batches_run ON bank_disbursal_batches(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_bank_disbursal_items_batch ON bank_disbursal_items(batch_id);
