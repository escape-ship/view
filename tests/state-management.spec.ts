import { test, expect, Page } from '@playwright/test';

// Test data fixtures
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: '테스트 상품 1',
    price: 29900,
    category: 'electronics',
    description: '테스트용 전자제품',
    image_url: '/images/test-product-1.jpg',
    stock: 100,
    is_active: true,
  },
  {
    id: 'prod-2',
    name: '테스트 상품 2', 
    price: 49900,
    category: 'clothing',
    description: '테스트용 의류',
    image_url: '/images/test-product-2.jpg',
    stock: 50,
    is_active: true,
  }
];

const MOCK_USER = {
  id: 'user-1',
  email: 'test@example.com',
  name: '테스트 사용자',
  role: 'user',
};

// Helper functions
async function mockApiResponse(page: Page, endpoint: string, response: any, status: number = 200) {
  await page.route(`**/api${endpoint}`, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

async function addProductToCart(page: Page, product: typeof MOCK_PRODUCTS[0], quantity: number = 1) {
  await mockApiResponse(page, `/products/${product.id}`, { product });
  
  await page.goto(`/products/${product.id}`);
  
  // Set quantity if different from 1
  if (quantity > 1) {
    await page.fill('[data-testid="quantity-input"]', quantity.toString());
  }
  
  await page.getByRole('button', { name: /장바구니 담기/i }).click();
  await expect(page.getByText(/장바구니에 추가되었습니다/i)).toBeVisible();
}

async function loginUser(page: Page, user = MOCK_USER) {
  await mockApiResponse(page, '/auth/login', {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    user,
  });

  await mockApiResponse(page, '/auth/me', { user });
  
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', 'testpassword123');
  await page.getByRole('button', { name: /로그인/i }).click();
  
  await expect(page).toHaveURL('/');
}

test.describe('State Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Cart State Management (Zustand)', () => {
    test('should add products to cart and persist state', async ({ page }) => {
      // Add first product
      await addProductToCart(page, MOCK_PRODUCTS[0], 2);
      
      // Verify cart state in header
      await expect(page.getByTestId('cart-count')).toHaveText('2');
      
      // Add second product
      await addProductToCart(page, MOCK_PRODUCTS[1], 1);
      
      // Verify updated cart count
      await expect(page.getByTestId('cart-count')).toHaveText('3');
      
      // Navigate to cart page
      await page.goto('/cart');
      
      // Verify both products are in cart
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      await expect(page.getByText(MOCK_PRODUCTS[1].name)).toBeVisible();
      
      // Verify quantities
      const product1Row = page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`);
      await expect(product1Row.getByTestId('quantity-display')).toHaveText('2');
      
      const product2Row = page.getByTestId(`cart-item-${MOCK_PRODUCTS[1].id}`);
      await expect(product2Row.getByTestId('quantity-display')).toHaveText('1');
      
      // Verify total price calculation
      const expectedTotal = (MOCK_PRODUCTS[0].price * 2) + MOCK_PRODUCTS[1].price;
      await expect(page.getByTestId('cart-total')).toHaveText(`₩${expectedTotal.toLocaleString()}`);
    });

    test('should update cart item quantities', async ({ page }) => {
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      await page.goto('/cart');
      
      const cartItem = page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`);
      
      // Increase quantity
      await cartItem.getByRole('button', { name: /증가/i }).click();
      await expect(cartItem.getByTestId('quantity-display')).toHaveText('2');
      
      // Check updated total
      const expectedTotal = MOCK_PRODUCTS[0].price * 2;
      await expect(page.getByTestId('cart-total')).toHaveText(`₩${expectedTotal.toLocaleString()}`);
      
      // Decrease quantity
      await cartItem.getByRole('button', { name: /감소/i }).click();
      await expect(cartItem.getByTestId('quantity-display')).toHaveText('1');
      
      // Check updated total
      await expect(page.getByTestId('cart-total')).toHaveText(`₩${MOCK_PRODUCTS[0].price.toLocaleString()}`);
    });

    test('should remove items from cart', async ({ page }) => {
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      await addProductToCart(page, MOCK_PRODUCTS[1], 1);
      
      await page.goto('/cart');
      
      // Remove first product
      const cartItem1 = page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`);
      await cartItem1.getByRole('button', { name: /삭제/i }).click();
      
      // Confirm removal
      await page.getByRole('button', { name: /확인/i }).click();
      
      // Verify product is removed
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).not.toBeVisible();
      await expect(page.getByText(MOCK_PRODUCTS[1].name)).toBeVisible();
      
      // Verify cart count updated
      await expect(page.getByTestId('cart-count')).toHaveText('1');
      
      // Verify total updated
      await expect(page.getByTestId('cart-total')).toHaveText(`₩${MOCK_PRODUCTS[1].price.toLocaleString()}`);
    });

    test('should clear entire cart', async ({ page }) => {
      await addProductToCart(page, MOCK_PRODUCTS[0], 2);
      await addProductToCart(page, MOCK_PRODUCTS[1], 1);
      
      await page.goto('/cart');
      
      // Clear cart
      await page.getByRole('button', { name: /장바구니 비우기/i }).click();
      await page.getByRole('button', { name: /확인/i }).click();
      
      // Verify cart is empty
      await expect(page.getByText(/장바구니가 비어있습니다/i)).toBeVisible();
      await expect(page.getByTestId('cart-count')).toHaveText('0');
    });

    test('should persist cart state across page reloads', async ({ page }) => {
      await addProductToCart(page, MOCK_PRODUCTS[0], 2);
      await addProductToCart(page, MOCK_PRODUCTS[1], 1);
      
      // Reload page
      await page.reload();
      
      // Verify cart state persisted
      await expect(page.getByTestId('cart-count')).toHaveText('3');
      
      // Navigate to cart and verify items
      await page.goto('/cart');
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      await expect(page.getByText(MOCK_PRODUCTS[1].name)).toBeVisible();
      
      // Verify quantities persisted
      await expect(page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`).getByTestId('quantity-display')).toHaveText('2');
      await expect(page.getByTestId(`cart-item-${MOCK_PRODUCTS[1].id}`).getByTestId('quantity-display')).toHaveText('1');
    });

    test('should prevent duplicate products in cart', async ({ page }) => {
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      
      // Try to add the same product again
      await addProductToCart(page, MOCK_PRODUCTS[0], 2);
      
      await page.goto('/cart');
      
      // Should combine quantities instead of creating duplicate entries
      const cartItems = page.getByTestId('cart-items').getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`);
      await expect(cartItems).toHaveCount(1);
      await expect(cartItems.getByTestId('quantity-display')).toHaveText('3');
    });

    test('should handle cart state across browser tabs', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      // Add item in first tab
      await addProductToCart(page1, MOCK_PRODUCTS[0], 1);
      
      // Check cart state in second tab
      await page2.goto('/');
      await expect(page2.getByTestId('cart-count')).toHaveText('1');
      
      // Add item in second tab
      await addProductToCart(page2, MOCK_PRODUCTS[1], 1);
      
      // Check updated state in first tab
      await page1.reload();
      await expect(page1.getByTestId('cart-count')).toHaveText('2');
      
      await page1.close();
      await page2.close();
    });
  });

  test.describe('Authentication State Management (React Context)', () => {
    test('should manage authentication state across components', async ({ page }) => {
      // Initially not authenticated
      await page.goto('/');
      await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible();
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
      
      // Login
      await loginUser(page);
      
      // Verify authenticated state in header
      await expect(page.getByRole('link', { name: /로그인/i })).not.toBeVisible();
      await expect(page.getByTestId('user-menu')).toBeVisible();
      await expect(page.getByText(MOCK_USER.name)).toBeVisible();
      
      // Navigate to different pages and verify state persists
      await page.goto('/products');
      await expect(page.getByTestId('user-menu')).toBeVisible();
      
      await page.goto('/about');
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });

    test('should persist authentication state across page reloads', async ({ page }) => {
      await loginUser(page);
      
      // Verify authenticated
      await expect(page.getByTestId('user-menu')).toBeVisible();
      
      // Reload page
      await page.reload();
      
      // Should still be authenticated
      await expect(page.getByTestId('user-menu')).toBeVisible();
      await expect(page.getByText(MOCK_USER.name)).toBeVisible();
    });

    test('should handle logout and clear authentication state', async ({ page }) => {
      await loginUser(page);
      
      // Logout
      await page.getByTestId('user-menu').click();
      await page.getByRole('button', { name: /로그아웃/i }).click();
      
      // Verify logged out state
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
      await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible();
      
      // Navigate to protected page should redirect
      await page.goto('/my-page');
      await expect(page).toHaveURL('/login?redirect=%2Fmy-page');
    });

    test('should handle token expiration', async ({ page }) => {
      await loginUser(page);
      
      // Mock expired token response
      await mockApiResponse(page, '/auth/me', {
        error: 'Token expired',
      }, 401);
      
      // Try to access protected content
      await page.goto('/my-page/profile');
      
      // Should handle expired token and redirect to login
      await expect(page).toHaveURL('/login?redirect=%2Fmy-page%2Fprofile');
      await expect(page.getByText(/세션이 만료되었습니다/i)).toBeVisible();
    });

    test('should handle different user roles', async ({ page }) => {
      const adminUser = { ...MOCK_USER, role: 'admin' };
      await loginUser(page, adminUser);
      
      // Admin user should see admin menu
      await page.getByTestId('user-menu').click();
      await expect(page.getByRole('link', { name: /관리자 페이지/i })).toBeVisible();
      
      // Login as regular user
      await page.getByRole('button', { name: /로그아웃/i }).click();
      await loginUser(page, MOCK_USER);
      
      // Regular user should not see admin menu
      await page.getByTestId('user-menu').click();
      await expect(page.getByRole('link', { name: /관리자 페이지/i })).not.toBeVisible();
    });

    test('should clear user-specific data on logout', async ({ page }) => {
      await loginUser(page);
      
      // Add some user-specific data (e.g., cart items)
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      
      // Logout
      await page.getByTestId('user-menu').click();
      await page.getByRole('button', { name: /로그아웃/i }).click();
      
      // User-specific data should be cleared
      // (depending on business logic, cart might persist or clear)
      // This tests the authentication clearing behavior
      const isAuthenticated = await page.evaluate(() => {
        return localStorage.getItem('auth_tokens') !== null;
      });
      expect(isAuthenticated).toBe(false);
    });
  });

  test.describe('TanStack Query State Management', () => {
    test('should cache API responses and manage loading states', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/products', async route => {
        requestCount++;
        // Add delay to test loading states
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: MOCK_PRODUCTS }),
        });
      });
      
      await page.goto('/products');
      
      // Should show loading state initially
      await expect(page.getByTestId('products-loading')).toBeVisible();
      
      // Should show products after loading
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      await expect(page.getByTestId('products-loading')).not.toBeVisible();
      
      // Navigate away and back - should use cached data
      await page.goto('/');
      await page.goto('/products');
      
      // Should not show loading state (using cache)
      await expect(page.getByTestId('products-loading')).not.toBeVisible();
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      
      // Should only have made one request due to caching
      expect(requestCount).toBe(1);
    });

    test('should handle error states and retry logic', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/products', async route => {
        requestCount++;
        if (requestCount < 3) {
          // Fail first two requests
          await route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server Error' }),
          });
        } else {
          // Succeed on third request
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ products: MOCK_PRODUCTS }),
          });
        }
      });
      
      await page.goto('/products');
      
      // Should show error state initially
      await expect(page.getByTestId('products-error')).toBeVisible();
      await expect(page.getByText(/상품을 불러오는데 실패했습니다/i)).toBeVisible();
      
      // Click retry
      await page.getByRole('button', { name: /다시 시도/i }).click();
      
      // Should eventually show products after retries
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      await expect(page.getByTestId('products-error')).not.toBeVisible();
    });

    test('should handle optimistic updates', async ({ page }) => {
      await loginUser(page);
      
      const mockOrders = [
        { id: 'order-1', order_number: 'ORD-001', status: 'pending', total_price: 29900 }
      ];
      
      await mockApiResponse(page, '/orders', { orders: mockOrders });
      await mockApiResponse(page, '/orders/order-1/cancel', { success: true });
      
      await page.goto('/my-page/orders');
      await expect(page.getByText('ORD-001')).toBeVisible();
      
      // Cancel order - should show optimistic update
      await page.getByRole('button', { name: /주문 취소/i }).click();
      await page.getByRole('button', { name: /확인/i }).click();
      
      // Should immediately show "취소됨" status (optimistic update)
      await expect(page.getByText(/취소됨/i)).toBeVisible();
    });

    test('should invalidate cache after mutations', async ({ page }) => {
      await loginUser(page);
      
      let getOrdersCount = 0;
      let createOrderCount = 0;
      
      await page.route('**/api/orders', async route => {
        if (route.request().method() === 'GET') {
          getOrdersCount++;
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ orders: [] }),
          });
        } else if (route.request().method() === 'POST') {
          createOrderCount++;
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ 
              id: 'new-order',
              order_number: 'ORD-NEW',
              status: 'pending'
            }),
          });
        }
      });
      
      // Visit orders page
      await page.goto('/my-page/orders');
      expect(getOrdersCount).toBe(1);
      
      // Create new order
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      await page.goto('/cart');
      await page.getByRole('button', { name: /주문하기/i }).click();
      
      // Fill and submit order form
      await page.fill('[data-testid="shipping-address"]', '서울시 강남구 테헤란로 123');
      await page.getByRole('button', { name: /주문 완료/i }).click();
      
      expect(createOrderCount).toBe(1);
      
      // Return to orders page - cache should be invalidated
      await page.goto('/my-page/orders');
      expect(getOrdersCount).toBe(2); // Should fetch again due to invalidation
    });

    test('should handle concurrent requests properly', async ({ page }) => {
      let requestCount = 0;
      const responses: Promise<void>[] = [];
      
      await page.route('**/api/products', async route => {
        requestCount++;
        // Simulate concurrent request handling
        const responsePromise = new Promise<void>(resolve => {
          setTimeout(() => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ products: MOCK_PRODUCTS }),
            });
            resolve();
          }, 300);
        });
        responses.push(responsePromise);
      });
      
      // Open multiple tabs that make the same request
      const page2 = await page.context().newPage();
      const page3 = await page.context().newPage();
      
      // Navigate all pages simultaneously
      const navigations = Promise.all([
        page.goto('/products'),
        page2.goto('/products'),
        page3.goto('/products'),
      ]);
      
      await navigations;
      await Promise.all(responses);
      
      // Due to request deduplication, should only make one request
      expect(requestCount).toBe(1);
      
      // All pages should show data
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      await expect(page2.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      await expect(page3.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      
      await page2.close();
      await page3.close();
    });
  });

  test.describe('Cross-Component State Synchronization', () => {
    test('should synchronize cart state across all components', async ({ page }) => {
      await page.goto('/');
      
      // Cart count should initially be 0
      await expect(page.getByTestId('cart-count')).toHaveText('0');
      
      // Add product from product page
      await addProductToCart(page, MOCK_PRODUCTS[0], 2);
      
      // Header cart count should update
      await expect(page.getByTestId('cart-count')).toHaveText('2');
      
      // Mini cart (if exists) should also update
      await page.getByTestId('cart-icon').hover();
      await expect(page.getByTestId('mini-cart-items')).toContainText(MOCK_PRODUCTS[0].name);
      await expect(page.getByTestId('mini-cart-total')).toContainText((MOCK_PRODUCTS[0].price * 2).toLocaleString());
      
      // Navigate to cart page
      await page.goto('/cart');
      
      // Cart page should show consistent state
      await expect(page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`)).toBeVisible();
      await expect(page.getByTestId('cart-total')).toHaveText(`₩${(MOCK_PRODUCTS[0].price * 2).toLocaleString()}`);
      
      // Update quantity from cart page
      await page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`).getByRole('button', { name: /증가/i }).click();
      
      // Header should immediately reflect the change
      await expect(page.getByTestId('cart-count')).toHaveText('3');
    });

    test('should synchronize authentication state across all auth-aware components', async ({ page }) => {
      await page.goto('/');
      
      // All auth-aware components should show logged-out state
      await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible();
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
      
      // Login
      await loginUser(page);
      
      // All components should immediately update
      await expect(page.getByRole('link', { name: /로그인/i })).not.toBeVisible();
      await expect(page.getByTestId('user-menu')).toBeVisible();
      
      // Navigate to a page with user-specific content
      await page.goto('/my-page');
      await expect(page.getByText(`안녕하세요, ${MOCK_USER.name}님`)).toBeVisible();
      
      // Logout from header
      await page.getByTestId('user-menu').click();
      await page.getByRole('button', { name: /로그아웃/i }).click();
      
      // Should redirect and all components should update
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible();
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
    });

    test('should handle state conflicts gracefully', async ({ page }) => {
      // Simulate a scenario where cart state might conflict
      await page.goto('/');
      
      // Add item to cart
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      
      // Simulate external cart modification (e.g., from another tab)
      await page.evaluate(() => {
        // Manually modify localStorage to simulate external change
        const cartData = JSON.parse(localStorage.getItem('cart-store') || '{}');
        if (cartData.state && cartData.state.items) {
          cartData.state.items[0].quantity = 5; // Change quantity externally
        }
        localStorage.setItem('cart-store', JSON.stringify(cartData));
        
        // Trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'cart-store',
          newValue: JSON.stringify(cartData),
        }));
      });
      
      // Navigate to cart page
      await page.goto('/cart');
      
      // Should handle the conflict gracefully (either use latest state or show warning)
      // This depends on implementation - testing that it doesn't crash
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
    });

    test('should maintain state consistency during navigation', async ({ page }) => {
      await loginUser(page);
      await addProductToCart(page, MOCK_PRODUCTS[0], 2);
      await addProductToCart(page, MOCK_PRODUCTS[1], 1);
      
      const testUrls = ['/', '/products', '/about', '/cart', '/my-page'];
      
      for (const url of testUrls) {
        await page.goto(url);
        
        // Auth state should be consistent
        await expect(page.getByTestId('user-menu')).toBeVisible();
        await expect(page.getByText(MOCK_USER.name)).toBeVisible();
        
        // Cart state should be consistent
        await expect(page.getByTestId('cart-count')).toHaveText('3');
        
        // Wait a bit to ensure state doesn't flicker
        await page.waitForTimeout(100);
        
        // Verify state is still consistent
        await expect(page.getByTestId('cart-count')).toHaveText('3');
        await expect(page.getByTestId('user-menu')).toBeVisible();
      }
    });

    test('should handle rapid state changes correctly', async ({ page }) => {
      await page.goto('/');
      await addProductToCart(page, MOCK_PRODUCTS[0], 1);
      
      await page.goto('/cart');
      
      const cartItem = page.getByTestId(`cart-item-${MOCK_PRODUCTS[0].id}`);
      const increaseButton = cartItem.getByRole('button', { name: /증가/i });
      const quantityDisplay = cartItem.getByTestId('quantity-display');
      
      // Rapidly click increase button
      for (let i = 0; i < 5; i++) {
        await increaseButton.click();
        await page.waitForTimeout(50); // Small delay between clicks
      }
      
      // Should handle rapid clicks correctly
      await expect(quantityDisplay).toHaveText('6');
      await expect(page.getByTestId('cart-count')).toHaveText('6');
      
      // Total should be correctly calculated
      const expectedTotal = MOCK_PRODUCTS[0].price * 6;
      await expect(page.getByTestId('cart-total')).toHaveText(`₩${expectedTotal.toLocaleString()}`);
    });
  });
});