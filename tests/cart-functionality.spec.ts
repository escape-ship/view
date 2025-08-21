import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should start with empty cart', async ({ page }) => {
    // Initially cart should show 0 items
    await expect(page.getByText('Items: 0')).toBeVisible();
    
    // Cart contents section should not be visible
    await expect(page.getByText('Cart Contents')).not.toBeVisible();
  });

  test('should add item to cart when button is clicked', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Click the add to cart button
    await addToCartButton.click();
    
    // Verify the item count updates
    await expect(page.getByText('Items: 1')).toBeVisible();
    
    // Verify cart contents section appears
    await expect(page.getByText('Cart Contents')).toBeVisible();
    
    // Verify the product is listed in cart
    await expect(page.getByText('Sample Product (x1)')).toBeVisible();
    
    // Verify the price is displayed (first occurrence)
    await expect(page.getByText('$29.99').first()).toBeVisible();
    
    // Verify total price
    await expect(page.getByText('Total: $29.99')).toBeVisible();
  });

  test('should update quantities when adding same item multiple times', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Add item twice
    await addToCartButton.click();
    await addToCartButton.click();
    
    // Verify the item count updates to 2
    await expect(page.getByText('Items: 2')).toBeVisible();
    
    // Verify quantity in cart display
    await expect(page.getByText('Sample Product (x2)')).toBeVisible();
    
    // Verify total price calculation (first occurrence)
    await expect(page.getByText('$59.98').first()).toBeVisible();
    await expect(page.getByText('Total: $59.98')).toBeVisible();
  });

  test('should maintain cart state during page interaction', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Add item to cart
    await addToCartButton.click();
    
    // Verify cart state persists
    await expect(page.getByText('Items: 1')).toBeVisible();
    
    // Add another item
    await addToCartButton.click();
    
    // Verify state updated correctly
    await expect(page.getByText('Items: 2')).toBeVisible();
    await expect(page.getByText('Sample Product (x2)')).toBeVisible();
  });

  test('should have proper styling for cart section', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Add item to make cart visible
    await addToCartButton.click();
    
    // Check that cart contents section has proper styling
    const cartSection = page.locator('.bg-background-tertiary').first();
    await expect(cartSection).toBeVisible();
    
    // Verify cart button has proper hover styling classes
    await expect(addToCartButton).toHaveClass(/hover:bg-primary\/90/);
    await expect(addToCartButton).toHaveClass(/transition-colors/);
  });

  test('should be accessible', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    
    // Verify button is accessible
    await expect(addToCartButton).toBeEnabled();
    
    // Test keyboard navigation
    await addToCartButton.focus();
    await page.keyboard.press('Enter');
    
    // Verify cart updated via keyboard interaction
    await expect(page.getByText('Items: 1')).toBeVisible();
  });
});