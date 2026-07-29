import { expect, test } from '@playwright/test';

const controlCenterPaths = [
  '/control-center',
  '/control-center/products',
  '/control-center/pricing',
  '/control-center/customers',
  '/control-center/audit-logs',
];

test('anonymous browser is redirected to login for every Control Center route, preserving the destination', async ({ page }) => {
  for (const path of controlCenterPaths) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get('next')).toBe(path);
  }
});

const demoTest = process.env.E2E_DEMO_LOGIN === 'true' ? test : test.skip;
demoTest('an authenticated non-Owner is denied the Control Center, not just redirected to login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // The demo identity has no platform_admins row, so it's authenticated
  // but not the Owner — this must land on the forbidden redirect, not a
  // second trip through /login (that would mean the auth check silently
  // treated "no session" and "wrong role" as the same failure).
  await page.goto('/control-center');
  await expect(page).toHaveURL(/\/dashboard\?error=forbidden$/);
});
