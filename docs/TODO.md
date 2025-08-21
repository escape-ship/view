# 🚀 쇼핑몰 프로젝트 TODO List

## 📋 프로젝트 초기 설정

### 1. 개발 환경 구성
- [x] Bun 설치 및 프로젝트 초기화
- [x] Next.js 14+ App Router 프로젝트 생성
- [x] TypeScript 설정
- [x] ESLint, Prettier 설정
- [x] 절대 경로 import 설정 (tsconfig.json paths)

### 2. 기본 패키지 설치
- [x] Tailwind CSS 설정
- [x] shadcn/ui 초기화 (`bunx shadcn@latest init`)
- [x] TanStack Query 설치 (`@tanstack/react-query`)
- [x] Zustand 설치 (`zustand`)
- [x] Axios 또는 Fetch wrapper 설정
- [x] Inter Variable 폰트 설정 (Linear Design System)

### 3. 환경 변수 설정
- [x] `.env.local` 파일 생성 (개발용)
- [x] `.env.production` 파일 생성 (배포용)
- [x] `NEXT_PUBLIC_API_URL` 환경 변수 설정
- [x] `.gitignore`에 `.env*.local` 추가

## 🏗️ 프로젝트 구조 설정

### 4. 폴더 구조 생성
```
- [x] src/
  - [x] app/
    - [x] (main)/ - 메인 레이아웃 그룹
    - [x] (auth)/ - 인증 레이아웃 그룹
    - [x] api/ - API 라우트
  - [x] components/
    - [x] ui/ - shadcn/ui 컴포넌트
    - [x] features/ - 도메인별 컴포넌트
    - [x] layout/ - 레이아웃 컴포넌트
  - [x] lib/
    - [x] api/ - API 함수
    - [x] utils/ - 유틸리티 함수
    - [x] theme/ - Linear Design System 테마 설정
  - [x] store/ - 상태 관리
  - [x] hooks/ - 커스텀 훅
  - [x] styles/ - 전역 스타일
  - [x] config/ - 설정 파일 (theme_data.json 포함)
```

## 🎨 UI 기본 컴포넌트 구현

### 5. Linear Design System 테마 설정
- [x] `lib/theme/colors.ts` - Linear 색상 시스템 구현
- [x] `lib/theme/typography.ts` - Inter Variable 타이포그래피
- [x] `lib/theme/spacing.ts` - 8px 기반 spacing 시스템
- [x] `lib/theme/animations.ts` - Linear transition/easing 설정
- [x] `tailwind.config.ts` - Linear 테마 통합 (Tailwind v4 @theme inline)
- [x] CSS 변수 설정 (Dark theme optimized)

### 6. shadcn/ui 컴포넌트 설치 및 커스터마이징
- [x] Button (`bunx shadcn@latest add button`) - Linear 스타일 적용
  - [x] Primary: 배경 #141516, 텍스트 #F7F8F8, borderRadius 30px
  - [x] Secondary: 투명 배경, 텍스트 #8A8F98, borderRadius 8px
  - [x] Outline: 배경 #28282C, border #3E3E44, borderRadius 9999px
- [x] Card (`bunx shadcn@latest add card`) - Linear 스타일 적용
  - [x] Default: 배경 rgba(40, 40, 40, 0.2), borderRadius 16px
  - [x] Elevated: 배경 #0F1011, borderRadius 30px
- [x] Input (`bunx shadcn@latest add input`) - Linear 스타일
- [x] Table (`bunx shadcn@latest add table`) - Linear 스타일
- [x] Form 관련 컴포넌트 (form, textarea, label, checkbox, radio-group)
- [x] Dialog/Modal - Linear overlay 스타일 (dialog, alert-dialog)
- [x] Toast/Alert - Linear 색상 시스템 (sonner, alert)
- [x] Dropdown Menu (`bunx shadcn@latest add dropdown-menu`)
- [x] Select (`bunx shadcn@latest add select`)
- [x] Skeleton (로딩 상태) - Linear shimmer 애니메이션
- [x] Badge (`bunx shadcn@latest add badge`) - Linear 스타일 적용

### 7. 레이아웃 컴포넌트
- [x] `components/layout/Header.tsx` - 네비게이션 바
  - [x] 높이 72px (Linear navigation height)
  - [x] 패딩 0 32px
  - [x] 배경색 #F7F8F8 또는 다크 모드
  - [x] 로고 (홈 링크)
  - [x] 상품 메뉴 (드롭다운)
  - [x] 커스텀 주문 메뉴
  - [x] 장바구니 아이콘 (수량 표시)
  - [x] 로그인/로그아웃/회원정보 버튼
  - [x] 모바일 반응형 햄버거 메뉴
- [x] `components/layout/Footer.tsx` - 푸터 (회사정보, 네비게이션, 뉴스레터)
- [x] `app/(main)/layout.tsx` - 메인 레이아웃 (max-width: 1200px)
- [x] `app/(auth)/layout.tsx` - 인증 레이아웃 (최소한의 스타일링)

## 💾 상태 관리 설정

### 8. TanStack Query 설정
- [x] `lib/providers.tsx` - QueryClient Provider 생성
- [x] `app/layout.tsx`에 QueryClientProvider 적용
- [x] Query 옵션 기본값 설정 (staleTime, gcTime 등)

### 9. Zustand 장바구니 스토어
- [x] `store/cart-store.ts` 생성
  - [x] 장바구니 상태 (items, totalPrice, totalItems)
  - [x] addItem 액션
  - [x] removeItem 액션
  - [x] updateQuantity 액션
  - [x] clearCart 액션
  - [x] persist middleware로 localStorage 저장

### 10. React Context API - 인증
- [ ] `store/authProvider.tsx` - AuthContext 생성
  - [ ] 로그인 상태
  - [ ] 사용자 정보
  - [ ] 토큰 관리
- [ ] `hooks/useAuth.ts` - 인증 훅

## 🌐 API 연동 설정

### 11. API 클라이언트 설정
- [ ] `lib/api/client.ts` - Axios 인스턴스 또는 Fetch wrapper
  - [ ] baseURL 설정 (환경 변수 사용)
  - [ ] 인터셉터 설정 (토큰 자동 추가)
  - [ ] 에러 핸들링

### 12. API 함수 구현
- [ ] `lib/api/product.ts`
  - [ ] fetchProducts() - 전체 상품 목록
  - [ ] fetchProductById() - 상품 상세
  - [ ] fetchProductsByCategory() - 카테고리별 상품
- [ ] `lib/api/auth.ts`
  - [ ] login() - 일반 로그인
  - [ ] register() - 회원가입
  - [ ] kakaoLogin() - 카카오 로그인
  - [ ] kakaoCallback() - 카카오 콜백
- [ ] `lib/api/order.ts`
  - [ ] createOrder() - 주문 생성
  - [ ] fetchOrders() - 주문 목록
- [ ] `lib/api/payment.ts`
  - [ ] kakaoPayReady() - 결제 준비
  - [ ] kakaoPayApprove() - 결제 승인

## 📄 페이지 구현

### 13. 메인 페이지
- [ ] `app/(main)/page.tsx`
- [ ] 이미지 캐러셀 컴포넌트
- [ ] 추천 상품 섹션
- [ ] TanStack Query로 상품 데이터 fetching

### 14. 상품 목록 페이지
- [ ] `app/(main)/products/page.tsx`
- [ ] 카테고리 메뉴 컴포넌트
- [ ] 상품 카드 컴포넌트 (`features/product/ProductCard.tsx`)
  - [ ] Linear Card 스타일 적용
  - [ ] 호버 효과 (transition: 0.16s cubic-bezier)
- [ ] 상품 목록 컴포넌트 (`features/product/ProductList.tsx`)
- [ ] 필터링 및 정렬 기능
- [ ] 페이지네이션 또는 무한 스크롤

### 15. 상품 상세 페이지
- [ ] `app/(main)/products/[id]/page.tsx`
- [ ] 상품 이미지 갤러리
- [ ] 상품 정보 표시
- [ ] 옵션 선택 UI
- [ ] 장바구니 담기 기능
- [ ] 바로 구매 기능

### 16. 장바구니 페이지
- [ ] `app/(main)/cart/page.tsx`
- [ ] 장바구니 테이블 (`features/cart/CartTable.tsx`)
- [ ] 수량 변경 기능
- [ ] 개별/선택 삭제 기능
- [ ] 주문 요약 카드 (`features/cart/OrderSummaryCard.tsx`)
  - [ ] Linear elevated card 스타일
- [ ] 고정 위치 구매 카드

### 17. 주문/결제 페이지
- [ ] `app/(main)/order/page.tsx`
- [ ] 주문자 정보 입력 폼
- [ ] 배송지 입력 폼
- [ ] 주문 상품 목록
- [ ] 결제 수단 선택
- [ ] 고정 위치 결제 카드

### 18. 결제 완료 페이지
- [ ] `app/(main)/payment/complete/page.tsx`
- [ ] 결제 완료 메시지
- [ ] 주문 상세 정보
- [ ] 홈/주문내역 버튼

### 19. 로그인 페이지
- [ ] `app/(auth)/login/page.tsx`
- [ ] 로그인 폼 (`features/auth/LoginForm.tsx`)
- [ ] 카카오 로그인 버튼
- [ ] 아이디 저장 기능
- [ ] 아이디/비밀번호 찾기 링크

### 20. 회원가입 페이지
- [ ] `app/(auth)/register/page.tsx`
- [ ] 회원가입 폼
- [ ] 유효성 검증
- [ ] 약관 동의

### 21. 마이페이지
- [ ] `app/(main)/my-page/page.tsx`
- [ ] 주문 내역 탭
- [ ] 최근 본 상품 탭
- [ ] 배송지 관리 탭
- [ ] 회원정보 변경 탭
- [ ] 회원 탈퇴

## 🔧 기능 구현

### 22. 인증 기능
- [ ] JWT 토큰 관리 (localStorage/cookie)
- [ ] 로그인 유지
- [ ] 자동 로그아웃
- [ ] Protected Route 구현

### 23. 장바구니 기능
- [ ] 장바구니 추가 시 토스트 알림
  - [ ] Linear 토스트 스타일 (성공: #68CC58, 에러: #C52828)
- [ ] 장바구니 수량 업데이트
- [ ] 장바구니 데이터 persist
- [ ] 장바구니 아이콘 뱃지 업데이트

### 24. 결제 기능
- [ ] 카카오페이 결제 플로우 구현
- [ ] 결제 준비 → 결제 페이지 → 콜백 처리
- [ ] 결제 실패 처리

### 25. 사용자 경험 개선
- [ ] 로딩 상태 (Skeleton UI)
  - [ ] Linear 애니메이션 적용
- [ ] 에러 처리 및 에러 바운더리
- [ ] 404 페이지
- [ ] SEO 메타 태그 설정
- [ ] 다크 모드 지원 (Linear Dark theme)

## 🧪 테스트 및 최적화

### 26. 테스트
- [ ] 컴포넌트 단위 테스트
- [ ] API 연동 테스트
- [ ] E2E 테스트 시나리오

### 27. 성능 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅
- [ ] 번들 사이즈 분석
- [ ] React Query 캐싱 최적화
- [ ] Linear 성능 원칙 적용 (obsessive focus on speed)

### 28. 접근성
- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 지원
- [ ] High contrast 모드 (Linear 접근성)

## 🚀 배포 준비

### 29. 빌드 및 배포 설정
- [ ] Docker 파일 작성
- [ ] Docker Compose 설정
- [ ] 환경 변수 설정
- [ ] CI/CD 파이프라인 구성

### 30. 모니터링
- [ ] 에러 로깅 설정
- [ ] 성능 모니터링
- [ ] 사용자 분석

### 31. 문서화
- [ ] README.md 작성
- [ ] API 문서화
- [ ] 컴포넌트 스토리북 (선택사항)

## 📝 Notes

- 각 작업 완료 시 체크박스에 표시
- 우선순위에 따라 작업 순서 조정 가능
- 추가 요구사항 발생 시 해당 섹션에 추가
- 각 기능 구현 후 테스트 진행

## 🎯 Milestones

1. **Phase 1**: ✅ 프로젝트 초기 설정 및 기본 구조 (1-4) **COMPLETED**
2. **Phase 2**: ✅ Linear Design System 테마 설정 (5) **COMPLETED**
3. **Phase 3**: ✅ UI 컴포넌트 및 레이아웃 (6-7) **COMPLETED**
4. **Phase 4**: 상태 관리 및 API 설정 (8-12)
5. **Phase 5**: 핵심 페이지 구현 (13-21)
6. **Phase 6**: 기능 구현 (22-25)
7. **Phase 7**: 테스트 및 최적화 (26-28)
8. **Phase 8**: 배포 및 운영 (29-31)

## 🎨 Linear Design System 핵심 원칙
- **Focus**: Relentless focus on core features
- **Execution**: Fast execution with smooth transitions
- **Craft**: Commitment to quality of craft
- **Simplicity**: Purposeful minimalism
- **Performance**: Obsessive focus on speed