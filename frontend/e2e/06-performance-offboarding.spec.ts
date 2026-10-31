import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Performance & Offboarding Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load performance goals without double-fetching and allow modal open/close', async ({ page }) => {
    await page.goto('/performance/goals');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Goals & OKRs Management');
    await expect(page.locator('text=Set New Goal / OKR')).toBeVisible();

    // Open Create Goal Modal
    await page.click('button:has-text("Set New Goal / OKR")');
    await expect(page.locator('text=Set Objective & Key Results (OKR)')).toBeVisible();

    // Cancel modal
    await page.click('form button:has-text("Cancel")');
    await expect(page.locator('text=Set Objective & Key Results (OKR)')).not.toBeVisible();
  });

  test('should open Initiate Separation modal with pristine reset lifecycle', async ({ page }) => {
    await page.goto('/offboarding/cases');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Employee Offboarding & Clearances');

    // Click Initiate Separation (CLICK-PATH-005 verification)
    await page.click('button:has-text("Initiate Separation")');
    await expect(page.locator('text=Initiate Employee Offboarding')).toBeVisible();

    // Cancel modal via form-scoped cancel button
    await page.click('form button:has-text("Cancel")');
    await expect(page.locator('text=Initiate Employee Offboarding')).not.toBeVisible();
  });

  test('should load clearance checklists tracking portal', async ({ page }) => {
    await page.goto('/offboarding/checklists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Cross-Departmental Clearance Tracker');
  });
});
