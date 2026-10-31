import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Attendance & Web Clock-In/Out', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display live digital clock, timezone, and punch profile card', async ({ page }) => {
    await page.goto('/attendance/punch');
    await page.waitForLoadState('networkidle');

    // Live clock header
    await expect(page.locator('text=Timezone: Asia/Jakarta (WIB)')).toBeVisible();

    // Verify Punch Profile section (CLICK-PATH-004 fix)
    await expect(page.locator('text=Punch Profile:')).toBeVisible();

    // Verify Geolocation card
    await expect(page.locator('text=GPS Coordinates:')).toBeVisible();

    // Verify Clock In / Clock Out action buttons
    await expect(page.locator('button:has-text("Clock In")').or(page.locator('button:has-text("Clocked In")'))).toBeVisible();
    await expect(page.locator('button:has-text("Clock Out")').or(page.locator('button:has-text("Clocked Out")'))).toBeVisible();
  });

  test('should navigate to attendance records and monthly recap', async ({ page }) => {
    await page.goto('/attendance/records');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h2:has-text("Daily Attendance Records")').or(page.locator('text=Daily Attendance Records'))).toBeVisible();

    // Navigate to monthly recap
    await page.goto('/attendance/monthly-recap');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Recalculate Metrics')).toBeVisible();
  });
});
