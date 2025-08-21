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

const MOCK_ORDER = {
  id: 'order-1',
  user_id: 'user-1',
  order_number: 'ORD-1234567890',
  status: 'pending',
  total_price: 79800,
  quantity: 2,
  payment_method: 'kakao_pay',
  shipping_fee: 2500,
  shipping_address: '서울시 강남구 테헤란로 123',
  ordered_at: '2024-01-01T00:00:00Z',
  items: [
    {
      id: 'item-1',
      product_id: 'prod-1',
      product_name: '테스트 상품 1',
      price: 29900,
      quantity: 1,
    },
    {
      id: 'item-2', 
      product_id: 'prod-2',
      product_name: '테스트 상품 2',
      price: 49900,
      quantity: 1,
    }
  ],
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

async function mockAuthenticatedUser(page: Page, user = MOCK_USER) {
  // Mock login endpoint
  await mockApiResponse(page, '/auth/login', {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    user,
  });

  // Mock user profile endpoint
  await mockApiResponse(page, '/auth/me', { user });
}

async function loginUser(page: Page) {
  await mockAuthenticatedUser(page);
  
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'testpassword123');
  await page.getByRole('button', { name: /로그인/i }).click();
  
  await expect(page).toHaveURL('/');
}

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Product API Integration', () => {
    test('should fetch and display products on homepage', async ({ page }) => {
      // Mock products API
      await mockApiResponse(page, '/products', {
        products: MOCK_PRODUCTS,
        total: 2,
        page: 1,
        limit: 20,
      });

      await page.goto('/');

      // Wait for products to load
      await expect(page.getByTestId('product-grid')).toBeVisible();
      
      // Check that products are displayed
      for (const product of MOCK_PRODUCTS) {
        await expect(page.getByText(product.name)).toBeVisible();
        await expect(page.getByText(`₩${product.price.toLocaleString()}`)).toBeVisible();
      }
    });

    test('should handle product search', async ({ page }) => {
      const searchTerm = '전자제품';
      const filteredProducts = MOCK_PRODUCTS.filter(p => 
        p.category === 'electronics' || p.description.includes(searchTerm)
      );

      // Mock search endpoint
      await mockApiResponse(page, `/products?search=${encodeURIComponent(searchTerm)}`, {
        products: filteredProducts,
        total: 1,
        page: 1,
        limit: 20,
      });

      await page.goto('/products');
      
      // Perform search
      await page.fill('[data-testid="search-input"]', searchTerm);
      await page.getByRole('button', { name: /검색/i }).click();

      // Verify filtered results
      await expect(page.getByText(filteredProducts[0].name)).toBeVisible();
      await expect(page.getByText(MOCK_PRODUCTS[1].name)).not.toBeVisible();
    });

    test('should handle product category filtering', async ({ page }) => {
      const category = 'electronics';
      const categoryProducts = MOCK_PRODUCTS.filter(p => p.category === category);

      // Mock category endpoint
      await mockApiResponse(page, `/products?category=${category}`, {
        products: categoryProducts,
        total: 1,
        page: 1,
        limit: 20,
      });

      await page.goto('/products');
      
      // Select category filter
      await page.getByRole('button', { name: /카테고리/i }).click();
      await page.getByRole('option', { name: /전자제품/i }).click();

      // Verify filtered results
      await expect(page.getByText(categoryProducts[0].name)).toBeVisible();
    });

    test('should handle product detail page', async ({ page }) => {
      const productId = MOCK_PRODUCTS[0].id;
      
      // Mock product detail endpoint
      await mockApiResponse(page, `/products/${productId}`, {
        product: MOCK_PRODUCTS[0],
      });

      await page.goto(`/products/${productId}`);

      // Check product details are displayed
      await expect(page.getByRole('heading', { name: MOCK_PRODUCTS[0].name })).toBeVisible();
      await expect(page.getByText(MOCK_PRODUCTS[0].description)).toBeVisible();
      await expect(page.getByText(`₩${MOCK_PRODUCTS[0].price.toLocaleString()}`)).toBeVisible();
      await expect(page.getByText(`재고: ${MOCK_PRODUCTS[0].stock}개`)).toBeVisible();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await mockApiResponse(page, '/products', {
        error: 'Internal server error',
      }, 500);

      await page.goto('/');

      // Check error message is displayed
      await expect(page.getByText(/상품을 불러오는데 실패했습니다/i)).toBeVisible();
      
      // Check retry button exists
      await expect(page.getByRole('button', { name: /다시 시도/i })).toBeVisible();
    });
  });

  test.describe('Cart and Order Integration', () => {
    test('should create order from cart items', async ({ page }) => {
      // Login first
      await loginUser(page);

      // Mock create order endpoint
      await mockApiResponse(page, '/orders', {
        id: MOCK_ORDER.id,
        order_number: MOCK_ORDER.order_number,
        status: MOCK_ORDER.status,
      });

      // Add items to cart (assuming cart functionality exists)
      await page.goto(`/products/${MOCK_PRODUCTS[0].id}`);
      await page.getByRole('button', { name: /장바구니 담기/i }).click();

      await page.goto('/cart');
      await page.getByRole('button', { name: /주문하기/i }).click();

      // Fill order form
      await page.fill('[data-testid="shipping-address"]', '서울시 강남구 테헤란로 123');
      await page.fill('[data-testid="customer-name"]', '테스트 사용자');
      await page.fill('[data-testid="customer-phone"]', '010-1234-5678');
      
      // Submit order
      await page.getByRole('button', { name: /주문 완료/i }).click();

      // Check order confirmation
      await expect(page.getByText(/주문이 완료되었습니다/i)).toBeVisible();
      await expect(page.getByText(MOCK_ORDER.order_number)).toBeVisible();
    });

    test('should fetch user orders', async ({ page }) => {
      await loginUser(page);

      // Mock orders endpoint
      await mockApiResponse(page, '/orders', {
        orders: [MOCK_ORDER],
        total: 1,
      });

      await page.goto('/my-page/orders');

      // Check orders are displayed
      await expect(page.getByText(MOCK_ORDER.order_number)).toBeVisible();
      await expect(page.getByText(`₩${MOCK_ORDER.total_price.toLocaleString()}`)).toBeVisible();
      await expect(page.getByText(/주문 대기/i)).toBeVisible(); // status translation
    });

    test('should show order details', async ({ page }) => {
      await loginUser(page);

      const orderId = MOCK_ORDER.id;
      
      // Mock order detail endpoint
      await mockApiResponse(page, `/orders/${orderId}`, {
        order: MOCK_ORDER,
      });

      await page.goto(`/order/${orderId}`);

      // Check order details
      await expect(page.getByText(MOCK_ORDER.order_number)).toBeVisible();
      await expect(page.getByText(MOCK_ORDER.shipping_address)).toBeVisible();
      
      // Check order items
      for (const item of MOCK_ORDER.items) {
        await expect(page.getByText(item.product_name)).toBeVisible();
        await expect(page.getByText(`₩${item.price.toLocaleString()}`)).toBeVisible();
        await expect(page.getByText(`수량: ${item.quantity}`)).toBeVisible();
      }
    });
  });

  test.describe('Payment Integration', () => {
    test('should initiate Kakao Pay payment', async ({ page }) => {
      await loginUser(page);

      const mockKakaoPayResponse = {
        tid: 'mock_transaction_id',
        next_redirect_pc_url: 'https://mockpay.kakao.com/redirect',
        next_redirect_mobile_url: 'https://mockpay.kakao.com/redirect',
      };

      // Mock Kakao Pay ready endpoint
      await mockApiResponse(page, '/payment/kakao/ready', mockKakaoPayResponse);

      // Add items to cart and proceed to payment
      await page.goto('/cart');
      // Assume cart has items
      await page.getByRole('button', { name: /결제하기/i }).click();

      // Select Kakao Pay
      await page.getByRole('radio', { name: /카카오페이/i }).check();
      await page.getByRole('button', { name: /결제 진행/i }).click();

      // Should store transaction ID in session storage
      const tidStored = await page.evaluate(() => sessionStorage.getItem('kakao_pay_tid'));
      expect(tidStored).toBe(mockKakaoPayResponse.tid);
    });

    test('should handle payment approval callback', async ({ page }) => {
      await loginUser(page);

      const mockApprovalResponse = {
        aid: 'approval_id',
        tid: 'transaction_id',
        partner_order_id: MOCK_ORDER.order_number,
        partner_user_id: MOCK_USER.id,
        payment_method_type: 'CARD',
        amount: {
          total: MOCK_ORDER.total_price,
        },
        approved_at: '2024-01-01T00:00:00Z',
      };

      // Mock Kakao Pay approve endpoint
      await mockApiResponse(page, '/payment/kakao/approve', mockApprovalResponse);

      // Simulate payment approval callback
      const callbackUrl = `/payment/callback?pg_token=mock_pg_token&tid=${mockApprovalResponse.tid}`;
      await page.goto(callbackUrl);

      // Should redirect to success page
      await expect(page).toHaveURL(`/payment/success?order_id=${MOCK_ORDER.order_number}`);
      await expect(page.getByText(/결제가 완료되었습니다/i)).toBeVisible();
    });

    test('should handle payment cancellation', async ({ page }) => {
      const cancelUrl = '/payment/callback?error=USER_CANCEL&error_description=사용자가 결제를 취소했습니다';
      await page.goto(cancelUrl);

      // Should redirect to failure page
      await expect(page).toHaveURL('/payment/failure');
      await expect(page.getByText(/결제가 취소되었습니다/i)).toBeVisible();
    });

    test('should handle payment errors', async ({ page }) => {
      await loginUser(page);

      // Mock payment error
      await mockApiResponse(page, '/payment/kakao/ready', {
        error: 'INVALID_REQUEST',
        error_description: '잘못된 요청입니다',
      }, 400);

      await page.goto('/cart');
      await page.getByRole('button', { name: /결제하기/i }).click();
      await page.getByRole('radio', { name: /카카오페이/i }).check();
      await page.getByRole('button', { name: /결제 진행/i }).click();

      // Should show error message
      await expect(page.getByText(/결제 준비에 실패했습니다/i)).toBeVisible();
    });
  });

  test.describe('Error Handling and Network Issues', () => {
    test('should handle network timeouts', async ({ page }) => {
      // Mock timeout by delaying response
      await page.route('**/api/products', async route => {
        await new Promise(resolve => setTimeout(resolve, 15000)); // Longer than timeout
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ products: MOCK_PRODUCTS }),
        });
      });

      await page.goto('/');

      // Should show timeout error
      await expect(page.getByText(/요청 시간이 초과되었습니다/i)).toBeVisible();
    });

    test('should handle server errors (5xx)', async ({ page }) => {
      await mockApiResponse(page, '/products', {
        error: 'Internal Server Error',
      }, 503);

      await page.goto('/');

      // Should show server error message
      await expect(page.getByText(/서버에 일시적인 문제가 발생했습니다/i)).toBeVisible();
    });

    test('should handle unauthorized requests', async ({ page }) => {
      await loginUser(page);

      // Mock 401 response for protected endpoint
      await mockApiResponse(page, '/orders', {
        error: 'Unauthorized',
      }, 401);

      await page.goto('/my-page/orders');

      // Should redirect to login page or show auth error
      await expect(page.getByText(/인증이 필요합니다|로그인이 필요합니다/i)).toBeVisible();
    });

    test('should retry failed requests', async ({ page }) => {
      let attemptCount = 0;
      
      await page.route('**/api/products', async route => {
        attemptCount++;
        if (attemptCount < 3) {
          // Fail first two attempts
          await route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server Error' }),
          });
        } else {
          // Succeed on third attempt
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ products: MOCK_PRODUCTS }),
          });
        }
      });

      await page.goto('/');

      // Should eventually show products after retries
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      expect(attemptCount).toBe(3);
    });
  });

  test.describe('Performance and Caching', () => {
    test('should cache API responses appropriately', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/products', async route => {
        requestCount++;
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ products: MOCK_PRODUCTS }),
        });
      });

      await page.goto('/');
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();

      // Navigate away and back
      await page.goto('/about');
      await page.goto('/');

      // Should use cached data (requestCount should still be 1)
      await expect(page.getByText(MOCK_PRODUCTS[0].name)).toBeVisible();
      expect(requestCount).toBe(1);
    });

    test('should invalidate cache on mutations', async ({ page }) => {
      await loginUser(page);
      
      let getRequestCount = 0;
      
      // Mock GET requests
      await page.route('**/api/orders', async route => {
        if (route.request().method() === 'GET') {
          getRequestCount++;
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ orders: [MOCK_ORDER] }),
          });
        }
      });

      // Mock POST request (create order)
      await mockApiResponse(page, '/orders', {
        id: 'new-order',
        order_number: 'ORD-NEW',
      });

      // First visit - should fetch orders
      await page.goto('/my-page/orders');
      await expect(page.getByText(MOCK_ORDER.order_number)).toBeVisible();
      expect(getRequestCount).toBe(1);

      // Create new order (mutation)
      await page.goto('/cart');
      await page.getByRole('button', { name: /주문하기/i }).click();
      // ... complete order process

      // Return to orders page - should refetch due to cache invalidation
      await page.goto('/my-page/orders');
      expect(getRequestCount).toBe(2);
    });
  });

  test.describe('Data Validation', () => {
    test('should validate required fields in API requests', async ({ page }) => {
      await loginUser(page);

      await page.goto('/cart');
      await page.getByRole('button', { name: /주문하기/i }).click();

      // Try to submit order without required fields
      await page.getByRole('button', { name: /주문 완료/i }).click();

      // Should show validation errors
      await expect(page.getByText(/배송 주소를 입력해주세요/i)).toBeVisible();
      await expect(page.getByText(/연락처를 입력해주세요/i)).toBeVisible();
    });

    test('should handle invalid API response data', async ({ page }) => {
      // Mock invalid product data
      await mockApiResponse(page, '/products', {
        products: [
          {
            // Missing required fields
            id: 'invalid-product',
            // price is missing
            name: '잘못된 상품',
          }
        ],
      });

      await page.goto('/');

      // Should handle gracefully and show error
      await expect(page.getByText(/상품 정보에 오류가 있습니다/i)).toBeVisible();
    });
  });
});