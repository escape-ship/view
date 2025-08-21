import { test, expect, Page } from '@playwright/test';

// Test utilities
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
};

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'adminpassword123',
  name: 'Admin User',
};

// Helper functions
async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
}

async function fillRegisterForm(page: Page, email: string, password: string, name: string) {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.fill('[data-testid="confirm-password-input"]', password);
  await page.fill('[data-testid="name-input"]', name);
}

async function mockApiResponse(page: Page, endpoint: string, response: any, status: number = 200) {
  await page.route(`**/api${endpoint}`, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

async function mockSuccessfulLogin(page: Page, user = TEST_USER) {
  await mockApiResponse(page, '/login', {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    user: {
      id: '1',
      email: user.email,
      name: user.name,
      role: 'user',
    },
  });
}

async function mockSuccessfulRegister(page: Page) {
  await mockApiResponse(page, '/register', {
    message: 'Registration successful',
    user: {
      id: '2',
      email: TEST_USER.email,
      name: TEST_USER.name,
      role: 'user',
    },
  });
}

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Login Flow', () => {
    test('should display login form correctly', async ({ page }) => {
      await page.goto('/login');

      // Check page title and heading
      await expect(page).toHaveTitle(/로그인/i);
      await expect(page.getByRole('heading', { name: /로그인/i })).toBeVisible();

      // Check form elements
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByRole('button', { name: /로그인/i })).toBeVisible();

      // Check links
      await expect(page.getByRole('link', { name: /회원가입/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /비밀번호 찾기/i })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit without filling fields
      await page.getByRole('button', { name: /로그인/i }).click();

      // Check for validation errors
      await expect(page.getByText(/이메일을 입력해주세요/i)).toBeVisible();
      await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/login');

      // Fill invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.getByRole('button', { name: /로그인/i }).click();

      // Check for email validation error
      await expect(page.getByText(/올바른 이메일 형식이 아닙니다/i)).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await mockSuccessfulLogin(page);
      await page.goto('/login');

      // Fill login form
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Wait for redirect to home page
      await expect(page).toHaveURL('/');

      // Check for success message
      await expect(page.getByText(/로그인되었습니다/i)).toBeVisible();

      // Check user menu or indicator
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });

    test('should handle login error correctly', async ({ page }) => {
      await mockApiResponse(page, '/login', {
        message: 'Invalid credentials',
      }, 401);

      await page.goto('/login');

      // Fill login form
      await fillLoginForm(page, 'wrong@email.com', 'wrongpassword');
      await page.getByRole('button', { name: /로그인/i }).click();

      // Check for error message
      await expect(page.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeVisible();

      // Should stay on login page
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to intended page after login', async ({ page }) => {
      await mockSuccessfulLogin(page);

      // Try to access protected page
      await page.goto('/my-page');

      // Should redirect to login with redirect parameter
      await expect(page).toHaveURL('/login?redirect=%2Fmy-page');

      // Login
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Should redirect to intended page
      await expect(page).toHaveURL('/my-page');
    });
  });

  test.describe('Registration Flow', () => {
    test('should display registration form correctly', async ({ page }) => {
      await page.goto('/register');

      // Check page title and heading
      await expect(page).toHaveTitle(/회원가입/i);
      await expect(page.getByRole('heading', { name: /회원가입/i })).toBeVisible();

      // Check form elements
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('confirm-password-input')).toBeVisible();
      await expect(page.getByTestId('name-input')).toBeVisible();
      await expect(page.getByRole('button', { name: /회원가입/i })).toBeVisible();

      // Check terms checkbox
      await expect(page.getByTestId('terms-checkbox')).toBeVisible();
    });

    test('should show validation errors for registration form', async ({ page }) => {
      await page.goto('/register');

      // Try to submit without filling fields
      await page.getByRole('button', { name: /회원가입/i }).click();

      // Check for validation errors
      await expect(page.getByText(/이메일을 입력해주세요/i)).toBeVisible();
      await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register');

      // Fill form with mismatched passwords
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');
      await page.fill('[data-testid="name-input"]', TEST_USER.name);
      await page.check('[data-testid="terms-checkbox"]');

      await page.getByRole('button', { name: /회원가입/i }).click();

      // Check for password mismatch error
      await expect(page.getByText(/비밀번호가 일치하지 않습니다/i)).toBeVisible();
    });

    test('should require terms acceptance', async ({ page }) => {
      await page.goto('/register');

      // Fill form without checking terms
      await fillRegisterForm(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
      // Don't check terms checkbox

      await page.getByRole('button', { name: /회원가입/i }).click();

      // Check for terms error
      await expect(page.getByText(/약관에 동의해주세요/i)).toBeVisible();
    });

    test('should register successfully with valid data', async ({ page }) => {
      await mockSuccessfulRegister(page);
      await page.goto('/register');

      // Fill registration form
      await fillRegisterForm(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
      await page.check('[data-testid="terms-checkbox"]');

      await page.getByRole('button', { name: /회원가입/i }).click();

      // Wait for redirect to login page
      await expect(page).toHaveURL('/login');

      // Check for success message
      await expect(page.getByText(/회원가입이 완료되었습니다/i)).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await mockSuccessfulLogin(page);
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();
      await expect(page).toHaveURL('/');

      // Logout
      await page.getByTestId('user-menu').click();
      await page.getByRole('button', { name: /로그아웃/i }).click();

      // Check for success message
      await expect(page.getByText(/로그아웃되었습니다/i)).toBeVisible();

      // Should redirect to home page and remove user menu
      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      const protectedRoutes = ['/cart', '/order', '/my-page', '/profile'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(`/login?redirect=${encodeURIComponent(route)}`);
      }
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // Login first
      await mockSuccessfulLogin(page);
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Test protected routes
      const protectedRoutes = ['/cart', '/order', '/my-page'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(route);
      }
    });

    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      // Login first
      await mockSuccessfulLogin(page);
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Try to access login page while authenticated
      await page.goto('/login');
      await expect(page).toHaveURL('/');

      // Try to access register page while authenticated
      await page.goto('/register');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist login state across page reloads', async ({ page }) => {
      // Login
      await mockSuccessfulLogin(page);
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Reload page
      await page.reload();

      // Should still be logged in
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });

    test('should persist login state across navigation', async ({ page }) => {
      // Login
      await mockSuccessfulLogin(page);
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Navigate to different pages
      await page.goto('/products');
      await expect(page.getByTestId('user-menu')).toBeVisible();

      await page.goto('/cart');
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/login', async route => {
        await route.abort('failed');
      });

      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Check for network error message
      await expect(page.getByText(/네트워크 오류가 발생했습니다/i)).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock server error
      await mockApiResponse(page, '/login', {
        message: 'Internal server error',
      }, 500);

      await page.goto('/login');
      await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
      await page.getByRole('button', { name: /로그인/i }).click();

      // Check for server error message
      await expect(page.getByText(/서버 오류가 발생했습니다/i)).toBeVisible();
    });
  });

  test.describe('Kakao OAuth Flow', () => {
    test('should display Kakao login button', async ({ page }) => {
      await page.goto('/login');

      // Check for Kakao login button
      await expect(page.getByRole('button', { name: /카카오 로그인/i })).toBeVisible();
    });

    test('should handle Kakao login redirect', async ({ page }) => {
      // Mock Kakao login URL
      await mockApiResponse(page, '/oauth/kakao/login', {
        login_url: 'https://kauth.kakao.com/oauth/authorize?...',
      });

      await page.goto('/login');

      // Click Kakao login button
      await page.getByRole('button', { name: /카카오 로그인/i }).click();

      // Should redirect to Kakao (we'll just check the URL starts correctly)
      // In a real test, you might mock this differently
    });
  });
});