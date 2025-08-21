# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a modern Next.js 15 e-commerce application built with:
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style)
- **State Management**: TanStack Query (server state) + Zustand (cart) + Context API (auth)
- **Testing**: Playwright for E2E testing
- **Build Tools**: Turbopack for fast development builds
- **Icons**: Lucide React

## Architecture

### Project Structure

This project follows a feature-based architecture with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router (pages & layouts)
│   ├── (main)/            # Main layout group (with Header/Footer)
│   │   ├── products/      # Product pages
│   │   ├── cart/          # Shopping cart
│   │   ├── order/         # Order management
│   │   └── layout.tsx     # Shared main layout
│   ├── (auth)/            # Auth layout group (minimal layout)
│   │   ├── login/
│   │   └── register/
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── features/          # Feature-specific components
│   │   ├── product/       # Product-related components
│   │   ├── cart/          # Cart-related components
│   │   └── auth/          # Auth-related components
│   └── layout/            # Layout components (Header, Footer)
├── lib/
│   ├── api/               # API client functions
│   ├── theme/             # Design system tokens
│   └── utils.ts           # Shared utilities
├── store/                 # Global state management
├── hooks/                 # Custom React hooks
└── styles/                # Global styles
```

### State Management Strategy

The project uses a layered state management approach:

1. **Server State**: TanStack Query for API data (products, orders, user data)
   - Configured with 1-minute stale time and 5-minute garbage collection
   - No refetch on window focus for better UX

2. **Global Client State**: 
   - **Authentication**: React Context API (low-frequency updates)
   - **Shopping Cart**: Zustand (high-frequency updates, complex logic)

3. **Local State**: React useState/useReducer for component-specific state

### Path Aliases

The project uses TypeScript path mapping for cleaner imports:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/store/*` → `./src/store/*`
- `@/config/*` → `./src/config/*`

## Development Commands

### Core Development

```bash
# Development server with Turbopack (fast builds)
bun run dev

# Production build with Turbopack
bun run build

# Start production server
bun run start

# Format code with Prettier
bun run format

# Check formatting
bun run format:check
```

### Code Quality

```bash
# Run ESLint
bun run lint

# Run ESLint with auto-fix
bun run lint:fix
```

### Testing

```bash
# Run all Playwright tests
bun run test

# Run tests with interactive UI
bun run test:ui

# Run tests in headed mode (visible browser)
bun run test:headed

# Show test report
bun run test:report
```

## Development Patterns

### Component Architecture

Components follow a hierarchical structure:
- **UI Components** (`@/components/ui`): Base shadcn/ui components
- **Feature Components** (`@/components/features`): Domain-specific components
- **Layout Components** (`@/components/layout`): Structural components

### Adding New Features

1. **New Page**: Create in appropriate route group under `src/app/(main)/` or `src/app/(auth)/`
2. **New Component**: 
   - UI components go in `@/components/ui/`
   - Feature-specific components go in `@/components/features/{domain}/`
3. **New API Integration**: Add functions to `@/lib/api/` and use TanStack Query
4. **New Global State**: Add to appropriate store (Zustand for complex state, Context for simple state)

### Styling Guidelines

- Uses Tailwind CSS 4 with CSS variables for theming
- Custom design system tokens in `@/lib/theme/`
- Components use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui "new-york" style patterns

### Testing Approach

The project uses comprehensive E2E testing with Playwright:
- **Cross-browser**: Chrome, Firefox, Safari (WebKit)
- **Mobile testing**: Pixel 5, iPhone 12 viewports
- **Test categories**: Homepage, cart functionality, responsive design, accessibility
- Tests automatically start development server on `http://localhost:3000`

### Key Files to Understand

- `src/lib/providers.tsx`: TanStack Query configuration and providers
- `src/app/layout.tsx`: Root layout with global providers
- `components.json`: shadcn/ui configuration
- `docs/UI_프로젝트_구조.md`: Detailed project structure documentation (Korean)
- `docs/UI_상태관리전략.md`: State management strategy documentation (Korean)

## Framework-Specific Considerations

### Next.js App Router
- Uses route groups `(main)` and `(auth)` for different layouts
- Server components by default, use `'use client'` only when needed
- API routes in `src/app/api/` for server-side functionality

### Turbopack Integration
- Development and build processes use `--turbopack` flag for faster builds
- Incremental builds cached in `tsconfig.tsbuildinfo`

### shadcn/ui Setup
- Configured for "new-york" style with TypeScript and RSC support
- Uses Lucide icons and neutral base color
- CSS variables enabled for theme customization

## Code Quality Standards

- **TypeScript**: Strict mode enabled with ES2017 target
- **ESLint**: Extends Next.js, TypeScript, and Prettier configurations
- **Prettier**: Configured with Tailwind CSS plugin for class sorting
- **Testing**: Playwright E2E tests covering user flows, accessibility, and responsive design

## Performance Considerations

- Uses Turbopack for fast development builds
- TanStack Query configured for optimal caching and stale-while-revalidate patterns
- Zustand for efficient cart state management with selective subscriptions
- Inter font with optimized weight loading (400, 500, 600)
- please use context7 when doing tasks about tailwind, zustand, axios, shadcn/ui, next.js, tanstack, react context API.
- please check @docs/UI_기획서.md and @docs/UI_프로젝트_구조.md before your job.
- This front-end project is for a gold and silver shop (rings, earrings, necklaces, bracelets) shopping mall.