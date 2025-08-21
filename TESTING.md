# Testing with Playwright

This project uses Playwright for end-to-end testing. Playwright provides cross-browser testing capabilities and simulates real user interactions.

## Setup Complete ✅

- Playwright installed and configured
- Test files created in `/tests` directory
- Package.json scripts added
- Git ignore updated for test artifacts

## Available Test Scripts

```bash
# Run all tests
bun run test

# Run tests with UI (interactive mode)
bun run test:ui

# Run tests in headed mode (see browser)
bun run test:headed

# Show test report
bun run test:report
```

## Test Files

### `/tests/homepage.spec.ts`
Tests the main homepage functionality:
- Page loading and content visibility
- Visual hierarchy and styling
- Setup checklist verification

### `/tests/cart-functionality.spec.ts`
Tests the shopping cart features:
- Adding items to cart
- Quantity updates
- Price calculations
- State persistence

### `/tests/responsive-design.spec.ts`
Tests responsive behavior across devices:
- Desktop, tablet, mobile viewports
- Touch interactions
- Content accessibility on all screen sizes

### `/tests/accessibility.spec.ts`
Tests accessibility compliance:
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes
- Color contrast

### `/tests/example.spec.ts`
Example test patterns and best practices:
- Basic test structure
- Common interaction patterns
- Network testing
- Screenshot testing

## Test Configuration

The project is configured with:
- **Browsers**: Chrome, Firefox, Safari (WebKit)
- **Mobile**: Pixel 5, iPhone 12
- **Base URL**: http://localhost:3000
- **Auto-start**: Development server starts automatically
- **Reports**: HTML report generated after tests

## Writing New Tests

Follow these patterns when writing tests:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: 'Click me' });
    
    // Act  
    await button.click();
    
    // Assert
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole()`, `getByText()`, `getByLabel()` over CSS selectors
2. **Wait for elements**: Use `await expect().toBeVisible()` instead of `waitFor`
3. **Be specific**: Use `.first()` or `.nth()` when multiple elements match
4. **Test user flows**: Focus on what users actually do
5. **Keep tests isolated**: Each test should be independent

## Common Issues and Solutions

### Multiple Elements Match
```typescript
// Problem: Error: strict mode violation
await expect(page.getByText('$29.99')).toBeVisible();

// Solution: Use .first() or be more specific
await expect(page.getByText('$29.99').first()).toBeVisible();
```

### Element Not Found
```typescript
// Use more flexible selectors
await expect(page.locator('text=Submit')).toBeVisible();
```

### Timeout Issues
```typescript
// Increase timeout for slow operations
await expect(page.getByText('Loading...')).toBeVisible({ timeout: 10000 });
```

## Debugging Tests

1. **Run in headed mode**: `bun run test:headed`
2. **Use test UI**: `bun run test:ui` 
3. **Add screenshots**: `await page.screenshot({ path: 'debug.png' })`
4. **Pause execution**: `await page.pause()`
5. **View test report**: `bun run test:report`

## Continuous Integration

Tests are configured to run in CI environments with:
- Retry on failure (2 retries)
- Single worker in CI
- HTML report generation
- Artifact collection for failures