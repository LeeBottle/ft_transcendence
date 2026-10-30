# 📋 오늘의 회원가입/인증 TODO

*(※ 2차 인증 및 42 OAuth 제외)*

### 1. 프론트엔드 (SignupPage.tsx & LoginPage.tsx)
- [x] **비밀번호 확인 입력란 추가**: `confirmPassword` 필드 및 비밀번호 일치 검증 로직
- [x] **가입 후 리다이렉트**: 가입 성공 시 로그인 페이지(`/login`) 이동
- [x] **제출 중 상태 처리**: `isSubmitting` 추가로 가입 버튼 중복 클릭 방지
- [x] **로그인 페이지 구현**: `LoginPage.tsx` 작성 및 라우터/Navbar 연결
- [x] **슬라이드 인간검증(SlideCaptcha)**: 로그인/회원가입 인간 인증 슬라이더 컴포넌트 적용

### 2. 백엔드 (Auth System)
- [x] **닉네임 검증 강화**: `SignupDto`에 길이지정 및 특수문자 제한 패턴 추가 (`@Length`, `@Matches`)
- [x] **로그인 API 구현**: `POST /auth/login` 엔드포인트 및 bcrypt 비밀번호 비교
- [x] **JWT 토큰 발급**: 로그인 성공 시 Access Token 발급 서비스 작성 (`JwtModule`)

### 3. 검증 & 테스트
- [x] Backend / Frontend 빌드 테스트 통과 (`npm run build`)
