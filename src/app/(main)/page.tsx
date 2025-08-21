'use client';

import { useCartStore } from '@/store/cart-store';

export default function Home() {
  const { addItem, items, totalPrice, totalItems } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: '1',
      name: 'Sample Product',
      price: 29.99,
      image: '/placeholder.jpg',
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mb-12 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-semibold">
          Shopping Mall - Linear Design System
        </h1>
        <p className="text-text-secondary mb-8 text-lg">
          Phase 1 Setup Complete ✅
        </p>

        {/* Theme showcase */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-2 font-medium">Color System</h3>
            <div className="flex justify-center gap-2">
              <div className="bg-primary h-8 w-8 rounded"></div>
              <div className="h-8 w-8 rounded bg-neutral-300"></div>
              <div className="bg-success h-8 w-8 rounded"></div>
            </div>
          </div>

          <div className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-2 font-medium">Typography</h3>
            <p className="text-text-secondary text-sm">Inter Variable Font</p>
            <p className="text-base font-medium">Linear Design System</p>
          </div>

          <div className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-2 font-medium">State Management</h3>
            <button
              onClick={handleAddToCart}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 transition-colors"
            >
              Add to Cart
            </button>
            <p className="mt-2 text-sm">Items: {totalItems}</p>
          </div>
        </div>

        {/* Cart status */}
        {items.length > 0 && (
          <div className="bg-background-tertiary mb-8 rounded-xl p-6">
            <h3 className="mb-4 font-medium">Cart Contents</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-border mt-4 border-t pt-4">
              <strong>Total: ${totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {/* Setup checklist */}
        <div className="bg-card border-border rounded-xl border p-6 text-left">
          <h3 className="mb-4 font-medium">Phase 1 - Setup Complete</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>Next.js 15+ with App Router</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>TypeScript with path aliases</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>Tailwind CSS with Linear Design System</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>shadcn/ui components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>TanStack Query + Zustand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>Inter Variable font</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>Environment variables</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✅</span>
              <span>Project structure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
