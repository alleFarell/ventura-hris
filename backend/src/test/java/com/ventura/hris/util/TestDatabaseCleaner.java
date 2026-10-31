package com.ventura.hris.util;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class TestDatabaseCleaner {

    private final JdbcTemplate jdbcTemplate;

    public TestDatabaseCleaner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void clean() {
        jdbcTemplate.execute("delete from exit_interviews");
        jdbcTemplate.execute("delete from offboarding_checklists");
        jdbcTemplate.execute("delete from offboarding_cases");
        jdbcTemplate.execute("delete from asset_allocations");
        jdbcTemplate.execute("delete from company_assets");
        jdbcTemplate.execute("delete from asset_categories");
        jdbcTemplate.execute("delete from employee_certifications");
        jdbcTemplate.execute("delete from training_enrollments");
        jdbcTemplate.execute("delete from training_sessions");
        jdbcTemplate.execute("delete from training_courses");
        jdbcTemplate.execute("delete from appraisal_360_feedback");
        jdbcTemplate.execute("delete from employee_appraisals");
        jdbcTemplate.execute("delete from competency_models");
        jdbcTemplate.execute("delete from performance_goal_key_results");
        jdbcTemplate.execute("delete from performance_goals");
        jdbcTemplate.execute("delete from performance_cycles");
        jdbcTemplate.execute("delete from job_offers");
        jdbcTemplate.execute("delete from interview_evaluations");
        jdbcTemplate.execute("delete from interview_schedules");
        jdbcTemplate.execute("delete from job_applications");
        jdbcTemplate.execute("delete from job_candidates");
        jdbcTemplate.execute("delete from job_postings");
        jdbcTemplate.execute("delete from job_requisitions");
        jdbcTemplate.execute("delete from employee_benefit_claims");
        jdbcTemplate.execute("delete from benefit_plans");
        jdbcTemplate.execute("delete from employee_bpjs_enrollments");
        jdbcTemplate.execute("delete from bank_disbursal_items");
        jdbcTemplate.execute("delete from bank_disbursal_batches");
        jdbcTemplate.execute("delete from payslips");
        jdbcTemplate.execute("delete from payroll_run_items");
        jdbcTemplate.execute("delete from employee_loan_installments");
        jdbcTemplate.execute("delete from employee_reimbursements");
        jdbcTemplate.execute("delete from employee_loans");
        jdbcTemplate.execute("delete from payroll_runs");
        jdbcTemplate.execute("delete from payroll_simulations");
        jdbcTemplate.execute("delete from payroll_attendance_cutoffs");
        jdbcTemplate.execute("delete from payroll_periods");
        jdbcTemplate.execute("delete from employee_salary_components");
        jdbcTemplate.execute("delete from employee_salary_profiles");
        jdbcTemplate.execute("delete from salary_structures");
        jdbcTemplate.execute("delete from monthly_attendance_recaps");
        jdbcTemplate.execute("delete from overtime_requests");
        jdbcTemplate.execute("delete from wfh_requests");
        jdbcTemplate.execute("delete from attendance_punch_logs");
        jdbcTemplate.execute("delete from attendance_records");
        jdbcTemplate.execute("delete from biometric_devices");
        jdbcTemplate.execute("delete from roster_assignments");
        jdbcTemplate.execute("delete from company_holidays");
        jdbcTemplate.execute("delete from shift_patterns");
        jdbcTemplate.execute("delete from shifts");
        jdbcTemplate.execute("delete from leave_approvals");
        jdbcTemplate.execute("delete from leave_requests");
        jdbcTemplate.execute("delete from leave_balances");
        jdbcTemplate.execute("delete from leave_types");
        jdbcTemplate.execute("delete from notifications");
        jdbcTemplate.execute("delete from audit_logs");
        jdbcTemplate.execute("delete from employee_documents");
        jdbcTemplate.execute("delete from employment_status_histories");
        jdbcTemplate.execute("delete from employment_contracts");
        jdbcTemplate.execute("delete from employee_emergency_contacts");
        jdbcTemplate.execute("delete from employee_personal_information");
        jdbcTemplate.execute("delete from employees");
        jdbcTemplate.execute("delete from organization_structure_histories");
        jdbcTemplate.execute("delete from organization_units");
        jdbcTemplate.execute("delete from positions");
        jdbcTemplate.execute("delete from divisions");
        jdbcTemplate.execute("delete from departments");
        jdbcTemplate.execute("delete from grades");
        jdbcTemplate.execute("delete from job_levels");
        jdbcTemplate.execute("delete from branches");
        jdbcTemplate.execute("delete from companies");
        jdbcTemplate.execute("delete from refresh_tokens");
        jdbcTemplate.execute("delete from user_roles");
        jdbcTemplate.execute("delete from users");
        jdbcTemplate.execute("delete from role_permissions");
        jdbcTemplate.execute("delete from roles");
    }
}
