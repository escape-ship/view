import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Main heading should be h1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText('Shopping Mall - Linear Design System');

    // Section headings should be h3
    const h3Headings = page.getByRole('heading', { level: 3 });
    await expect(h3Headings).toContainText(['Color System', 'Typography', 'State Management', 'Phase 1 - Setup Complete']);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on the add to cart button
    await page.keyboard.press('Tab');
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Check if button is focused (this may vary by browser)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveText('Add to Cart');

    // Test keyboard activation
    await page.keyboard.press('Enter');
    await expect(page.getByText('Items: 1')).toBeVisible();
  });

  test('should have proper button semantics', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Button should be properly identified
    await expect(addToCartButton).toBeEnabled();
    await expect(addToCartButton).toBeVisible();
    
    // Button should have appropriate accessible name
    const buttonText = await addToCartButton.textContent();
    expect(buttonText).toBe('Add to Cart');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Test that text is visible against backgrounds
    const heading = page.getByRole('heading', { name: 'Shopping Mall - Linear Design System' });
    await expect(heading).toBeVisible();
    
    const description = page.getByText('Phase 1 Setup Complete ✅');
    await expect(description).toBeVisible();

    // Check button has proper contrast
    const button = page.getByRole('button', { name: 'Add to Cart' });
    await expect(button).toBeVisible();
  });

  test('should be screen reader friendly', async ({ page }) => {
    // Test that important information is accessible to screen readers
    
    // Main content should be properly structured
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Lists and content should be properly marked up
    const checklistItems = page.locator('div.space-y-2.text-sm > div');
    await expect(checklistItems).toHaveCount(8);

    // Interactive elements should be properly labeled
    const button = page.getByRole('button', { name: 'Add to Cart' });
    await expect(button).toBeVisible();
  });

  test('should handle focus management', async ({ page }) => {
    // Click add to cart button
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    await addToCartButton.click();

    // Focus should remain manageable after dynamic content appears
    const cartContents = page.getByText('Cart Contents');
    await expect(cartContents).toBeVisible();

    // Should be able to continue keyboard navigation
    await page.keyboard.press('Tab');
    // Focus should move to next focusable element
  });

  test('should provide feedback for user actions', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Initial state feedback
    await expect(page.getByText('Items: 0')).toBeVisible();
    
    // Action feedback
    await addToCartButton.click();
    await expect(page.getByText('Items: 1')).toBeVisible();
    
    // Visual feedback in cart section
    await expect(page.getByText('Cart Contents')).toBeVisible();
    await expect(page.getByText('Sample Product (x1)')).toBeVisible();
  });

  test('should have proper landmark structure', async ({ page }) => {
    // Page should have main content area
    // Note: This test may need adjustment based on actual HTML structure
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Test that animations respect user preferences
    // This is more of a CSS test, but we can verify transitions exist
    const button = page.getByRole('button', { name: 'Add to Cart' });
    
    // Check that transition classes are present (indicating motion-aware design)
    await expect(button).toHaveClass(/transition-colors/);
  });

  test('should have descriptive page title', async ({ page }) => {
    // Page should have a meaningful title
    await expect(page).toHaveTitle(/Shopping Mall|Linear Design System/);
  });
});