import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Employee Directory & Master Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should render employee directory header and controls', async ({ page }) => {
    await page.goto('/employee');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Employee Directory');
    await expect(page.locator('text=Add Employee').or(page.locator('button:has-text("Add Employee")'))).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should open and cancel the Add Employee modal cleanly', async ({ page }) => {
    await page.goto('/employee');
    await page.waitForLoadState('networkidle');

    // Click Add Employee
    const addBtn = page.locator('button:has-text("Add Employee")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('text=Add New Employee').or(page.locator('text=Personal Information'))).toBeVisible();

      // Click Cancel
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('text=Personal Information')).not.toBeVisible();
    }
  });
});
