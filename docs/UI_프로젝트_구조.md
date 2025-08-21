# **쇼핑몰 프로젝트 폴더(디렉토리) 구조**

Next.js의 App Router를 기반으로, 기능별로 파일을 명확하게 분리하여 유지보수가 용이하도록 설계된 구조입니다.  
.  
├── public/                  \# 이미지, 폰트 등 정적 에셋  
│   └── images/  
│       └── logo.png  
├── src/  
│   ├── app/                 \# Next.js 라우팅 및 페이지  
│   │   ├── (main)/          \# 메인 레이아웃을 공유하는 라우트 그룹  
│   │   │   ├── products/  
│   │   │   │   ├── page.tsx         \# 상품 목록 페이지  
│   │   │   │   └── \[id\]/  
│   │   │   │       └── page.tsx     \# 상품 상세 페이지  
│   │   │   ├── cart/  
│   │   │   │   └── page.tsx         \# 장바구니 페이지  
│   │   │   ├── order/  
│   │   │   │   └── page.tsx         \# 주문 페이지  
│   │   │   ├── my-page/  
│   │   │   │   └── page.tsx         \# 마이페이지  
│   │   │   ├── layout.tsx       \# Header, Footer를 포함한 메인 레이아웃  
│   │   │   └── page.tsx         \# 메인 홈 페이지  
│   │   ├── (auth)/          \# 로그인/회원가입 전용 라우트 그룹  
│   │   │   ├── login/  
│   │   │   │   └── page.tsx  
│   │   │   ├── register/  
│   │   │   │   └── page.tsx  
│   │   │   └── layout.tsx       \# 인증 페이지용 심플 레이아웃  
│   │   ├── api/               \# API 라우트 (백엔드 기능)  
│   │   └── layout.tsx         \# 최상위 Root 레이아웃  
│   │  
│   ├── components/            \# 재사용 가능한 컴포넌트  
│   │   ├── ui/                \# 🎨 (Atom) shadcn/ui 기반의 순수 UI 요소  
│   │   │   ├── button.tsx  
│   │   │   ├── input.tsx  
│   │   │   ├── card.tsx  
│   │   │   └── ...           \# form, dialog, select 등 15개 컴포넌트  
│   │   ├── features/          \# 🧩 (Organism) 특정 도메인/기능별 컴포넌트  
│   │   │   ├── product/  
│   │   │   │   ├── ProductCard.tsx  
│   │   │   │   └── ProductList.tsx  
│   │   │   ├── cart/  
│   │   │   │   ├── CartTable.tsx  
│   │   │   │   └── OrderSummaryCard.tsx  
│   │   │   └── auth/  
│   │   │       └── LoginForm.tsx  
│   │   └── layout/            \# 뼈대를 구성하는 레이아웃 컴포넌트  
│   │       ├── Header.tsx  
│   │       └── Footer.tsx  
│   │  
│   ├── lib/                   \# 라이브러리, 헬퍼 함수  
│   │   ├── api/               \# API 요청 관련 함수  
│   │   │   ├── client.ts      \# Axios 인스턴스 및 인터셉터  
│   │   │   ├── auth.ts        \# 인증 관련 API  
│   │   │   ├── product.ts     \# 상품 관련 API  
│   │   │   ├── order.ts       \# 주문 관련 API  
│   │   │   ├── payment.ts     \# 결제 관련 API  
│   │   │   └── errors.ts      \# API 에러 핸들링  
│   │   ├── theme/             \# 🎨 Linear Design System 테마  
│   │   │   ├── colors.ts  
│   │   │   ├── typography.ts  
│   │   │   ├── spacing.ts  
│   │   │   ├── animations.ts  
│   │   │   └── index.ts  
│   │   ├── providers.tsx      \# 모든 Provider 통합 (QueryClient, Auth 등)  
│   │   └── utils.ts           \# 공통 유틸리티 함수 (cn, formatPrice 등)  
│   │  
│   ├── store/                 \# 🏪 전역 상태 관리  
│   │   ├── authProvider.tsx   \# 인증 Context Provider (JWT 관리)  
│   │   └── cartStore.ts       \# 장바구니 Zustand 스토어  
│   │  
│   ├── hooks/                 \# 🎣 커스텀 훅  
│   │   └── api/               \# API 관련 TanStack Query 훅  
│   │       ├── useAuth.ts     \# 로그인, 회원가입, 카카오 인증  
│   │       ├── useProducts.ts \# 상품 목록, 상세, 카테고리  
│   │       ├── useOrders.ts   \# 주문 생성, 조회, 상태 업데이트  
│   │       └── usePayments.ts \# 카카오페이 준비, 승인, 취소  
│   │  
│   ├── types/                 \# 📝 TypeScript 타입 정의  
│   │   ├── api.ts             \# API 요청/응답 타입  
│   │   ├── payment.ts         \# 카카오페이 관련 타입  
│   │   └── index.ts           \# 타입 재내보내기  
│   │  
│   ├── config/                \# ⚙️ 설정 파일  
│   │   └── theme_data.json    \# Linear 테마 데이터  
│   │  
│   ├── styles/                \# 💅 전역 스타일  
│   │   └── globals.css        \# 전역 CSS 및 Tailwind 설정  
│   │  
│   └── middleware.ts          \# 🛡️ Next.js Edge Middleware (JWT 검증)  
│  
├── .eslintrc.json  
├── next.config.mjs  
├── package.json  
└── tsconfig.json

### **주요 폴더 설명**

* **app/(main) vs app/(auth)**: Next.js의 라우트 그룹( )을 사용해 레이아웃을 분리했습니다. (main) 그룹에 속한 페이지들은 Header와 Footer가 있는 공통 레이아웃을 사용하고, (auth) 그룹은 로그인/회원가입만을 위한 단순한 레이아웃을 사용하게 됩니다.

* **components/ui vs components/features**: ui 폴더에는 버튼, 인풋처럼 프로젝트 어디서든 재사용할 수 있는 순수한 UI 조각들(shadcn/ui 컴포넌트)을 두고, features 폴더에는 '상품 카드', '장바구니 테이블'처럼 특정 기능과 강하게 결합된 컴포넌트들을 기능별로 묶어서 관리합니다.

* **lib/api**: API 호출 로직을 컴포넌트에서 분리하여 이곳에 모아두었습니다. `client.ts`에서 Axios 인스턴스와 JWT 자동 갱신을 관리하고, 도메인별로 API 함수를 분리했습니다. API 명세가 변경되더라도 이 폴더의 파일들만 수정하면 되기 때문에 유지보수가 매우 편리합니다.

* **hooks/api**: TanStack Query를 사용하는 모든 API 훅을 모아두는 곳입니다. 각 도메인별로 파일을 분리하여 `useProducts`, `useAuth` 등의 훅을 제공합니다. 컴포넌트에서는 이 훅들을 사용하여 서버 상태를 관리합니다.

* **store**: 전역으로 관리해야 할 클라이언트 상태 로직을 모아두는 곳입니다. `authProvider.tsx`는 JWT 토큰과 사용자 정보를 관리하고, `cartStore.ts`는 장바구니 상태를 Zustand로 관리합니다.

* **types**: TypeScript 타입 정의를 중앙화한 폴더입니다. API 요청/응답 타입, 카카오페이 관련 타입 등 프로젝트 전체에서 사용되는 타입을 관리합니다.

* **middleware.ts**: Next.js Edge Runtime에서 실행되는 미들웨어로, JWT 토큰 검증과 보호된 라우트 접근 제어를 담당합니다. 서버 사이드에서 인증을 처리하여 보안성과 성능을 향상시킵니다.

* **lib/theme**: Linear Design System의 디자인 토큰을 관리하는 폴더입니다. 색상, 타이포그래피, 간격, 애니메이션 등을 중앙화하여 일관된 디자인을 유지합니다.

* **lib/providers.tsx**: 모든 React Provider(QueryClient, AuthContext 등)를 통합 관리하는 파일입니다. 이를 통해 root layout의 복잡도를 줄이고 Provider 중첩을 깔끔하게 관리합니다.

이 구조를 따르면 프로젝트가 커져도 파일을 찾기 쉽고, 코드의 역할과 책임이 명확해져서 개발 효율이 올라갑니다. 특히 API 훅과 타입을 분리하여 TypeScript의 장점을 최대한 활용할 수 있습니다.