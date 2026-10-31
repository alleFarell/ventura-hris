import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Payroll Execution & Processing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should render payroll execution dashboard with metrics and run history', async ({ page }) => {
    await page.goto('/payroll/runs');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Batch Payroll Runs');
    await expect(page.locator('text=Execute New Payroll Run').first()).toBeVisible();
  });

  test('should open and close Execute Payroll modal cleanly', async ({ page }) => {
    await page.goto('/payroll/runs');
    await page.waitForLoadState('networkidle');

    // Click Execute Payroll Run
    await page.click('button:has-text("Execute New Payroll Run")');
    await expect(page.locator('text=Execute New Payroll Run').first()).toBeVisible();

    // Cancel modal
    await page.click('form button:has-text("Cancel")');
    await expect(page.locator('form button:has-text("Cancel")')).not.toBeVisible();
  });
});
