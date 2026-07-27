import { expect, test } from '@playwright/test';

const protectedPaths = ['/dashboard', '/invoices', '/upload', '/verification', '/reviews', '/reports', '/activity', '/settings'];

test('login links to a signup form that fits a standard laptop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/login');

  const createAccountLink = page.getByRole('link', { name: 'Create Account' });
  await expect(createAccountLink).toBeVisible();
  await createAccountLink.click();
  await expect(page).toHaveURL(/\/signup$/);

  const createAccountButton = page.getByRole('button', { name: 'Create Account' });
  await expect(createAccountButton).toBeVisible();
  const buttonBounds = await createAccountButton.boundingBox();
  expect(buttonBounds).not.toBeNull();
  expect(buttonBounds!.y + buttonBounds!.height).toBeLessThanOrEqual(768);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(768);
});

test('protected routes redirect an anonymous browser to login', async ({ page }) => {
  for (const path of protectedPaths) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get('next')).toBe(path);
  }
});

test('invalid credentials show a non-enumerating error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(`missing-${crypto.randomUUID()}@example.invalid`);
  await page.getByLabel('Password').fill('incorrect-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid email address or password.');
});

const demoTest = process.env.E2E_DEMO_LOGIN === 'true' ? test : test.skip;
demoTest('development demo login persists across refresh and logs out', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Demo Organization')).toBeVisible();
  await expect(page.getByText('owner', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
});

const email = process.env.E2E_ONBOARDING_EMAIL;
const password = process.env.E2E_ONBOARDING_PASSWORD;
const onboardingTest = email && password ? test : test.skip;
onboardingTest('a membership-free user enters the dashboard and organization features stay protected', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Your workspace is ready' })).toBeVisible();
  await page.goto('/invoices');
  await expect(page).toHaveURL(/\/organization-required\?next=%2Finvoices$/);
  await expect(page.getByRole('heading', { name: 'Create an organization to continue' })).toBeVisible();
  await page.getByRole('link', { name: 'Create Organization' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel('Organization name').fill(`E2E Organization ${crypto.randomUUID().slice(0, 8)}`);
  await page.getByRole('button', { name: 'Create organization' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('owner', { exact: true })).toBeVisible();
});
