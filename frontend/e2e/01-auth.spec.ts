import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  test('should render the login portal with correct branding', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Ventura HRIS');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should reject invalid credentials and show error banner', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'WrongPassword999');
    await page.click('button[type="submit"]');

    // Verify error banner appears
    await expect(page.locator('text=Authentication Failed')).toBeVisible({ timeout: 10000 });
  });

  test('should authenticate admin and persist JWT token in localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'Admin1!');
    await page.click('button[type="submit"]');

    // Wait for redirect to /setup
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Check localStorage has access token
    const token = await page.evaluate(() => localStorage.getItem('ventura_access_token'));
    expect(token).toBeTruthy();

    // Verify user profile banner in sidebar
    await expect(
      page.locator('text=System Administrator').or(page.locator('text=admin')).first()
    ).toBeVisible();
  });

  test('should successfully sign out and clear session state', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'Admin1!');
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Click Sign Out button in sidebar
    const signOutBtn = page.locator('button[title="Sign Out"]');
    await expect(signOutBtn).toBeVisible({ timeout: 10000 });
    await signOutBtn.click();

    // Verify localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem('ventura_access_token'));
    expect(token).toBeNull();

    // Verify Sign In button is visible after logout
    await expect(page.locator('button[type="submit"]:has-text("Sign In")')).toBeVisible({ timeout: 10000 });
  });
});
