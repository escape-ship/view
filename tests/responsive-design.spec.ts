import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Verify desktop layout - grid should show 3 columns
    const showcaseGrid = page.locator('.grid.gap-6.md\\:grid-cols-3');
    await expect(showcaseGrid).toBeVisible();

    // All three cards should be visible in a row
    await expect(page.getByText('Color System')).toBeVisible();
    await expect(page.getByText('Typography')).toBeVisible();
    await expect(page.getByText('State Management')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Content should be visible and properly arranged
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();
    
    // Cards should still be accessible
    await expect(page.getByText('Color System')).toBeVisible();
    await expect(page.getByText('Typography')).toBeVisible();
    await expect(page.getByText('State Management')).toBeVisible();
  });

  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main heading should be visible
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();
    
    // All cards should still be accessible on mobile
    await expect(page.getByText('Color System')).toBeVisible();
    await expect(page.getByText('Typography')).toBeVisible();
    await expect(page.getByText('State Management')).toBeVisible();

    // Add to cart functionality should work on mobile
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    await expect(page.getByText('Items: 1')).toBeVisible();
  });

  test('should maintain functionality across different screen sizes', async ({ page }) => {
    // Test cart functionality on different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop large
      { width: 1280, height: 720 },  // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Test add to cart functionality at each size
      const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
      await expect(addToCartButton).toBeVisible();
      
      await addToCartButton.click();
      await expect(page.getByText('Items: 1')).toBeVisible();
      
      // Reset for next iteration (reload page)
      await page.reload();
    }
  });

  test('should have touch-friendly interactions on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Verify button is large enough for touch interaction
    const buttonBox = await addToCartButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
    
    // Test touch interaction
    await addToCartButton.tap();
    await expect(page.getByText('Items: 1')).toBeVisible();
  });

  test('should handle text overflow on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Very small mobile
    await page.goto('/');

    // Main heading should still be visible even on very small screens
    const heading = page.getByRole('heading', { name: 'Shopping Mall - Linear Design System' });
    await expect(heading).toBeVisible();
    
    // Check that text doesn't overflow container
    const headingBox = await heading.boundingBox();
    const pageBox = await page.locator('body').boundingBox();
    
    if (headingBox && pageBox) {
      expect(headingBox.width).toBeLessThanOrEqual(pageBox.width);
    }
  });
});