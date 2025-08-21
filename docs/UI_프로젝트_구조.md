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
│   │   │   ├── Button.tsx  
│   │   │   ├── Input.tsx  
│   │   │   └── Card.tsx  
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
│   │   ├── api/               \# API 요청 관련 함수 (TanStack Query와 연동)  
│   │   │   ├── product.ts  
│   │   │   └── order.ts  
│   │   ├── queryProvider.tsx  \# TanStack Query 클라이언트 프로바이더  
│   │   └── utils.ts           \# 공통 유틸리티 함수 (e.g., cn, formatPrice)  
│   │  
│   ├── store/                 \# 🏪 전역 상태 관리 (Zustand, Context API)  
│   │   ├── authProvider.tsx   \# 인증 정보 Context Provider  
│   │   └── cartStore.ts       \# 장바구니 Zustand 스토어  
│   │  
│   ├── hooks/                 \# 🎣 커스텀 훅  
│   │   ├── useAuth.ts         \# 인증 Context를 쉽게 사용하기 위한 훅  
│   │   └── useCart.ts         \# 장바구니 스토어를 쉽게 사용하기 위한 훅  
│   │  
│   └── styles/                \# 💅 전역 스타일  
│       └── globals.css  
│  
├── .eslintrc.json  
├── next.config.mjs  
├── package.json  
└── tsconfig.json

### **주요 폴더 설명**

* **app/(main) vs app/(auth)**: Next.js의 라우트 그룹( )을 사용해 레이아웃을 분리했습니다. (main) 그룹에 속한 페이지들은 Header와 Footer가 있는 공통 레이아웃을 사용하고, (auth) 그룹은 로그인/회원가입만을 위한 단순한 레이아웃을 사용하게 됩니다.  
* **components/ui vs components/features**: ui 폴더에는 버튼, 인풋처럼 프로젝트 어디서든 재사용할 수 있는 순수한 UI 조각들을 두고, features 폴더에는 '상품 카드', '장바구니 테이블'처럼 특정 기능과 강하게 결합된 컴포넌트들을 기능별로 묶어서 관리합니다.  
* **lib/api**: API 호출 로직을 컴포넌트에서 분리하여 이곳에 모아두면, 나중에 API 명세가 변경되더라도 이 폴더의 파일들만 수정하면 되기 때문에 유지보수가 매우 편리해집니다.  
* **store**: 전역으로 관리해야 할 상태 로직을 모아두는 곳입니다. 상태 관리 도구별로 파일을 분리하여 관리합니다.

이 구조를 따르면 프로젝트가 커져도 파일을 찾기 쉽고, 코드의 역할과 책임이 명확해져서 개발 효율이 올라갈 거야.