import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Setup & Organization Modules', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load company and branch settings page', async ({ page }) => {
    await page.goto('/setup');
    await page.waitForLoadState('networkidle');

    // Check header and cards
    await expect(page.locator('h1')).toContainText('System & Foundation Setup');
    await expect(page.locator('text=Corporate Entities').first()).toBeVisible();
    await expect(page.locator('text=Branch Locations').first()).toBeVisible();
  });

  test('should navigate to Organization Units and display departments and positions', async ({ page }) => {
    await page.goto('/organization');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Organization Management');
    await expect(page.locator('text=Departments & Divisions').first()).toBeVisible();
    await expect(page.locator('button:has-text("Positions")')).toBeVisible();
    await expect(page.locator('button:has-text("Grades & Job Levels")')).toBeVisible();

    // Verify switching tabs
    await page.click('button:has-text("Positions")');
    await expect(page.locator('text=Add Position').first()).toBeVisible();

    await page.click('button:has-text("Grades & Job Levels")');
    await expect(page.getByRole('heading', { name: 'Salary Grades' })).toBeVisible();
  });
});
