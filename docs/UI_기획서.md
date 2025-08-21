# **쇼핑몰 UI/UX 기획서**

## **1\. 기술 스택, 개발 방향 및 환경**

* **Core Framework:** Bun, Next.js (App Router 기반)  
* **Styling:** Tailwind CSS, shadcn/ui  
* **상태 관리 (State Management):**  
  * **Server State:** TanStack Query (React Query)  
  * **Global State:** Zustand (장바구니), React Context API (인증 상태)  
  * **Local State:** useState, useReducer  
* **개발 방향:**  
  * 기능별 모듈화를 고려한 폴더 구조 채택  
  * 재사용성을 극대화한 컴포넌트 설계 (ui와 features로 분리)  
* **배포 환경:**  
  * **배포 방식:** Docker Compose  
  * **백엔드 API 주소:** http://gatewaysrv:8080  
* **환경 변수 (Environment Variables):**  
  * **관리:** 프로젝트 루트에 .env 파일을 생성하여 관리  
    * .env.local: 개발 환경 (http://localhost:8080)  
    * .env.production: 배포 환경 (http://gatewaysrv:8080)  
  * **변수명 규칙:** 브라우저에서 접근 가능하도록 NEXT\_PUBLIC\_ 접두사 사용 (예: NEXT\_PUBLIC\_API\_URL)  
  * **보안:** 민감 정보 유출 방지를 위해 .gitignore에 .env\*.local 추가

## **2\. 공통 레이아웃**

### **네비게이션 바 (Header)**

* **좌측:** 이미지 로고 (클릭 시 홈 화면으로 이동)  
* **우측 메뉴:** 상품, 커스텀 주문, 장바구니, 로그인/로그아웃/회원정보

### **푸터 (Footer)**

* 모든 페이지 최하단에 공통으로 노출

## **3\. 페이지별 상세 기획**

### **3.1. 메인 화면**

* **구성:** 네비게이션 바 \- 이미지 캐러셀 \- 푸터 순서로 배치  
* **이미지 캐러셀:** 중앙에 위치하여 주요 상품이나 이벤트를 노출  
* **API 연동:**  
  * GET /products: 캐러셀에 노출할 추천 상품 목록 조회

### **3.2. 상품 목록 페이지**

* **카테고리:** 네비게이션 바 아래에 별도 메뉴로 제공  
* **상품 표시:** 카드 형태로 상품 목록을 나열  
* **상품 카드 구성:** 상품 이미지, 이름, 가격, 선택 가능한 옵션  
* **API 연동:**  
  * GET /products: 전체 상품 목록 조회  
  * GET /products/{id}: 특정 상품 상세 정보 조회 (상품 카드 클릭 시)

### **3.3. 장바구니 페이지**

* **상품 표시:** 테이블 형태로 표시 (컬럼: 상품 이미지, 상품 이름, 선택 옵션, 가격, 수량)  
* **핵심 기능:** 수량 변경, 개별/선택 삭제, 토스트 알림  
* **UI/UX:** 스크롤 시에도 '구매 카드'는 화면에 고정  
* **API 연동:** (장바구니 관련 API가 명세에 없어 클라이언트 상태관리 \- Zustand로 처리)

### **3.4. 주문/결제 페이지**

* **입력 정보:** 주문자 정보, 배송지, 주문 상품 목록, 결제 수단 선택  
* **UI/UX:** 스크롤 시에도 '결제 카드'는 화면에 고정  
* **API 연동:**  
  * POST /payment/kakao/ready: '결제하기' 버튼 클릭 시 카카오페이 결제 준비 요청  
  * POST /v1/order/insert: 결제 준비 완료 후, 주문 정보 생성

### **3.5. 결제 완료**

* **프로세스:** 카카오페이 결제 페이지에서 돌아온 후, 결제 승인 처리  
* **완료 화면:** "결제가 완료되었습니다." 메시지 표시  
* **API 연동:**  
  * POST /payment/kakao/approve: 최종 결제 승인 요청

## **4\. 회원 기능**

### **4.1. 로그인 / 회원가입**

* **기능:** 일반/카카오 로그인, 회원가입, 아이디/비밀번호 찾기, 아이디 저장  
* **UX 흐름:** 회원가입 시 자동 로그인, 로그인 시 홈으로 이동  
* **API 연동:**  
  * POST /register: 회원가입 요청  
  * POST /login: 일반 로그인 요청  
  * GET /oauth/kakao/login: 카카오 로그인 페이지 URL 요청  
  * POST /oauth/kakao/callback: 카카오 로그인 콜백 처리

### **4.2. 마이페이지 (회원정보)**

* **메뉴 구성:** 주문 내역, 최근 본 상품, 배송지 관리, 회원정보 변경, 회원 탈퇴  
* **API 연동:**  
  * GET /v1/order: 해당 유저의 전체 주문 목록 조회

## **5\. API 명세서 (protos)**

### **ProductService**

* **상품 정보 (Product)**  
  * id: string  
  * name: string  
  * category: string  
  * price: int64  
  * image\_url: string  
  * description: string  
  * created\_at: string  
  * updated\_at: string  
  * options\_json: string  
* **전체 상품 목록 조회:** GET /products  
* **상품 ID로 조회:** GET /products/{id}  
* **상품 추가:** POST /products

### **AccountService**

* **카카오 로그인 URL 요청:** GET /oauth/kakao/login  
* **카카오 콜백 처리:** POST /oauth/kakao/callback  
* **일반 로그인:** POST /login  
* **회원가입:** POST /register

### **OrderService**

* **주문 생성:** POST /v1/order/insert  
* **전체 주문 목록 조회:** GET /v1/order

### **PaymentService (Kakao)**

* **카카오 결제 준비:** POST /payment/kakao/ready  
* **카카오 결제 승인:** POST /payment/kakao/approve  
* **카카오 결제 취소:** POST /payment/kakao/cancel