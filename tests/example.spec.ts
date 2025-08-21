import { test, expect } from '@playwright/test';

/**
 * Example Playwright tests to demonstrate basic testing patterns
 * 
 * This file shows common Playwright testing patterns that you can use
 * as a reference when writing your own tests.
 */

test.describe('Example Tests - Basic Patterns', () => {
  test('basic page loading and content verification', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to load and check if title contains expected text
    await expect(page).toHaveTitle(/Shopping Mall|Linear/);

    // Check if specific text is visible on the page
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();
  });

  test('button interaction and state changes', async ({ page }) => {
    await page.goto('/');

    // Find a button by its text and click it
    const button = page.getByRole('button', { name: 'Add to Cart' });
    await button.click();

    // Verify the state change after clicking
    await expect(page.getByText('Items: 1')).toBeVisible();
  });

  test('form input and validation (example pattern)', async ({ page }) => {
    await page.goto('/');

    // Example of how you would test form inputs
    // Note: This is a demo - your actual forms may be different
    
    // Fill in text inputs
    // await page.getByPlaceholder('Enter your email').fill('test@example.com');
    
    // Select from dropdowns
    // await page.getByRole('combobox').selectOption('Option 1');
    
    // Check checkboxes
    // await page.getByRole('checkbox', { name: 'Accept terms' }).check();
    
    // Submit form
    // await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify result
    // await expect(page.getByText('Form submitted successfully')).toBeVisible();
  });

  test('responsive design testing', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify content is still accessible on mobile
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();
  });

  test('keyboard navigation and accessibility', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check if focus moved to expected element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test keyboard activation
    await page.keyboard.press('Enter');
    // Add assertions based on expected behavior
  });

  test('network requests and API testing', async ({ page }) => {
    // Listen for network requests
    page.on('request', request => {
      console.log('Request:', request.url());
    });

    page.on('response', response => {
      console.log('Response:', response.url(), response.status());
    });

    await page.goto('/');
    
    // Your app might make API calls - you can test them here
    // await expect(page.getByText('Data loaded')).toBeVisible();
  });

  test('screenshots and visual testing', async ({ page }) => {
    await page.goto('/');

    // Take a screenshot of the entire page
    await page.screenshot({ path: 'tests/screenshots/homepage-full.png', fullPage: true });

    // Take a screenshot of a specific element
    const cartSection = page.getByText('State Management').locator('..');
    await cartSection.screenshot({ path: 'tests/screenshots/cart-section.png' });

    // You can use visual comparisons (requires baseline images)
    // await expect(page).toHaveScreenshot('homepage.png');
  });

  test('waiting for dynamic content', async ({ page }) => {
    await page.goto('/');

    // Click button that triggers dynamic content
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Wait for specific text to appear
    await expect(page.getByText('Cart Contents')).toBeVisible();

    // Wait for specific element to be hidden/shown
    await expect(page.getByText('Items: 1')).toBeVisible();

    // Wait for network requests to complete
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Test Hooks and Setup', () => {
  test.beforeEach(async ({ page }) => {
    // This runs before each test in this describe block
    await page.goto('/');
    
    // You can set up common test data here
    // await page.addInitScript(() => {
    //   localStorage.setItem('test-mode', 'true');
    // });
  });

  test.afterEach(async ({ page }) => {
    // This runs after each test in this describe block
    // Clean up, take screenshots on failure, etc.
  });

  test('test with setup from beforeEach', async ({ page }) => {
    // Page is already loaded from beforeEach
    await expect(page.getByText('Shopping Mall - Linear Design System')).toBeVisible();
  });
});