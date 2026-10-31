-- V15__create_recruitment_and_applicant_tables.sql
-- Sprint 14: Job Requisitions, Postings & Applicant Tracking System (ATS)

CREATE TABLE IF NOT EXISTS job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    headcount INT NOT NULL DEFAULT 1,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'PERMANENT',
    min_salary NUMERIC(15, 2),
    max_salary NUMERIC(15, 2),
    justification TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    requested_by UUID REFERENCES employees(id),
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id UUID NOT NULL REFERENCES job_requisitions(id) ON DELETE CASCADE,
    posting_title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(100),
    is_published BOOLEAN NOT NULL DEFAULT false,
    closing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    resume_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES job_candidates(id) ON DELETE CASCADE,
    application_number VARCHAR(50) NOT NULL UNIQUE,
    application_date DATE NOT NULL,
    current_stage VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    rating INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requisitions_dept ON job_requisitions(department_id);
CREATE INDEX IF NOT EXISTS idx_postings_req ON job_postings(requisition_id);
CREATE INDEX IF NOT EXISTS idx_applications_posting ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON job_applications(current_stage);
