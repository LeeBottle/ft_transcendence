# 🛠️ 기술 스택 상세 설명: 2. 프론트엔드 (Frontend)

`ft_transcendence` 프론트엔드는 React 18과 Vite를 기반으로 빠르고 부드러운 단일 페이지 애플리케이션(SPA)을 제공합니다.

---

### 2-1. React 18 + Vite (TypeScript)
* **React 18**:
  * 컴포넌트 기반 UI 라이브러리로, 상태(State)가 변경되면 변경된 부분만 효율적으로 재렌더링합니다.
* **Vite**:
  * 기존 Webpack 대비 초고속 번들링 및 HMR(Hot Module Replacement)을 제공하는 최신 빌드 도구입니다.
* **TypeScript**:
  * 컴포넌트 Props나 API 응답 데이터의 타입을 명시하여 실행 전 에러를 방지합니다.

---

### 2-2. Tailwind CSS
* **역할**: 전역 및 컴포넌트 스타일링
* **특징**:
  * 별도의 CSS 파일을 매번 만들지 않고 `className="bg-gray-900 text-white p-4 flex"` 처럼 유틸리티 클래스를 조합하여 빠르게 반응형 UI를 작성합니다.
  * 프로젝트 전반의 다크 모드 테마 일관성을 쉽게 유지합니다.

---

### 2-3. 라우팅 & 상태 관리 (React Router DOM v6, LocalStorage, Custom Event)
* **React Router DOM v6**:
  * 페이지 전환 시 서버에서 페이지 전체를 다시 받지 않고, 브라우저 주소(`/login`, `/signup`, `/profile`)에 따라 해당 컴포넌트만 교체합니다.
* **LocalStorage**:
  * 로그인에 성공했을 때 받은 `accessToken`과 `user` 프로필 객체를 브라우저에 저장하여 페이지를 닫았다 켜도 로그인 상태를 유지합니다.
* **Custom Event (`auth-change`)**:
  * 로그인/로그아웃 시 `window.dispatchEvent(new Event('auth-change'))`를 발생시켜, 상단바(`Navbar`)가 새로고침 없이 즉시 반응하여 로그인/로그아웃 상태를 반영합니다.

---

### 2-4. 실시간 통신 (Socket.IO Client)
* **역할**: 백엔드 Socket.IO 서버와 연결
* **특징**:
  * 실시간 소켓 연결을 통해 게임 대기방 레디 상태, 게임 주사위/패들 움직임, 채팅 메시지를 즉각 수신하여 화면에 업데이트합니다.

---

### 2-5. 커스텀 위젯 (Custom Canvas & Widgets)
* **3x3 퍼즐 Captcha (`PuzzleCaptcha.tsx`)**:
  * HTML5 버튼 그리드와 단방향 10단계 셔플 알고리즘으로 구축된 보안 인간 검증 위젯입니다.
* **복권 긁기 칭호 모달 (`TitleUnlockModal.tsx`)**:
  * HTML5 Canvas의 `globalCompositeOperation = 'destination-out'` 속성을 이용해 마우스/터치로 은색 레이어를 문질러서 칭호를 확인하는 Gamification 모달입니다.
