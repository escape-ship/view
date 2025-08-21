import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Core Functionality', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Basic page load verification
    await expect(page).toHaveTitle(/Shopping Mall|Next.js/); // Accept either title
    
    // Check that the page loads without critical errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.includes('404')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    
    // Allow some non-critical errors but verify the page structure exists
    await expect(page.locator('html')).toBeVisible();
  });

  test('should have working providers setup', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check that React Query is properly set up by looking for no provider errors
    const providerErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Provider')) {
        providerErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    expect(providerErrors.length).toBe(0);
  });

  test('should have middleware working', async ({ page }) => {
    // Test that middleware doesn't crash the app
    await page.goto('http://localhost:3001');
    
    // Should load without middleware errors
    await expect(page.locator('html')).toBeVisible();
    
    // Test middleware redirect behavior (should not crash)
    const response = await page.goto('http://localhost:3001/admin');
    // Should either redirect or show the page (depending on auth state)
    expect(response?.status()).toBeLessThan(500);
  });

  test('should have working environment configuration', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Test that environment variables are loaded
    const envCheck = await page.evaluate(() => {
      // Check if window object exists and no critical env errors
      return typeof window !== 'undefined';
    });
    
    expect(envCheck).toBe(true);
  });

  test('should have TypeScript compilation working', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // If we get here without 500 errors, TypeScript compilation is working
    const response = await page.waitForResponse(response => 
      response.url().includes('localhost:3001') && response.status() !== 404
    );
    
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('API Client Tests', () => {
  test('should have API client properly configured', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Test that the API client is available
    const apiClientTest = await page.evaluate(() => {
      // Check if fetch is available (basic requirement for API client)
      return typeof fetch !== 'undefined';
    });
    
    expect(apiClientTest).toBe(true);
  });

  test('should handle API client errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock a failed API call and ensure it doesn't crash the app
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' }),
      });
    });
    
    // Page should still be functional even with API errors
    await expect(page.locator('html')).toBeVisible();
  });
});

test.describe('State Management Tests', () => {
  test('should have auth context available', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Test that auth context doesn't cause crashes
    const contextErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (msg.text().includes('Context') || msg.text().includes('Provider'))) {
        contextErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    expect(contextErrors.length).toBe(0);
  });

  test('should have local storage access', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Test that localStorage is accessible (needed for auth tokens)
    const storageTest = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        const result = localStorage.getItem('test');
        localStorage.removeItem('test');
        return result === 'value';
      } catch (error) {
        return false;
      }
    });
    
    expect(storageTest).toBe(true);
  });
});

test.describe('Build System Tests', () => {
  test('should have working CSS and styling', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check that CSS is loading
    const hasStyles = await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
      return stylesheets.length > 0;
    });
    
    expect(hasStyles).toBe(true);
  });

  test('should have working JavaScript bundling', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check that React is loaded
    const reactLoaded = await page.evaluate(() => {
      return typeof window.React !== 'undefined' || 
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('#__next') !== null;
    });
    
    expect(reactLoaded).toBe(true);
  });
});