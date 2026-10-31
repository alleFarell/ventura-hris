CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_asset_category_code UNIQUE (company_id, code)
);

CREATE INDEX idx_asset_categories_company ON asset_categories(company_id);

CREATE TABLE company_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
    asset_tag VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE NOT NULL,
    purchase_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    condition_grade VARCHAR(30) NOT NULL DEFAULT 'EXCELLENT',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_company_asset_tag UNIQUE (company_id, asset_tag)
);

CREATE INDEX idx_company_assets_company ON company_assets(company_id);
CREATE INDEX idx_company_assets_category ON company_assets(category_id);
CREATE INDEX idx_company_assets_status ON company_assets(status);

CREATE TABLE asset_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES company_assets(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    allocated_date DATE NOT NULL,
    return_date DATE,
    handover_notes TEXT,
    return_notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_allocations_asset ON asset_allocations(asset_id);
CREATE INDEX idx_asset_allocations_employee ON asset_allocations(employee_id);
CREATE INDEX idx_asset_allocations_status ON asset_allocations(status);
