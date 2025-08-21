import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Shopping Mall - Linear Design System' })).toBeVisible();
  });

  test('should display phase 1 setup completion', async ({ page }) => {
    await expect(page.getByText('Phase 1 Setup Complete ✅')).toBeVisible();
  });

  test('should display the three main showcase cards', async ({ page }) => {
    // Color System card
    await expect(page.getByText('Color System')).toBeVisible();
    
    // Typography card
    await expect(page.getByText('Typography')).toBeVisible();
    await expect(page.getByText('Inter Variable Font')).toBeVisible();
    
    // State Management card
    await expect(page.getByText('State Management')).toBeVisible();
  });

  test('should display all setup checklist items', async ({ page }) => {
    const checklistItems = [
      'Next.js 15+ with App Router',
      'TypeScript with path aliases', 
      'Tailwind CSS with Linear Design System',
      'TanStack Query + Zustand',
      'Inter Variable font',
      'Environment variables',
      'Project structure'
    ];

    for (const item of checklistItems) {
      await expect(page.getByText(item)).toBeVisible();
    }

    // Verify all items have checkmarks
    const checkmarks = page.locator('span.text-success');
    await expect(checkmarks).toHaveCount(8);
  });

  test('should have proper visual hierarchy', async ({ page }) => {
    // Check that the main heading has the correct styling
    const mainHeading = page.getByRole('heading', { name: 'Shopping Mall - Linear Design System' });
    await expect(mainHeading).toHaveClass(/text-4xl/);
    await expect(mainHeading).toHaveClass(/font-semibold/);
  });
});