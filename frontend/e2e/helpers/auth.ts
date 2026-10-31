import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'Admin1!');
  await page.click('button[type="submit"]');

  // Expect navigation away from /login (redirects to /setup or dashboard)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Verify authenticated indicator in AppShell sidebar
  await expect(
    page.locator('text=System Administrator').or(page.locator('text=admin')).first()
  ).toBeVisible({ timeout: 10000 });
}
