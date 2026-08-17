# 🚀 [Feature] 로그인/회원가입 시스템, 3x3 퍼즐 인간검증 & 칭호 모달 구현

## 📌 작업 개요
* 이슈 번호: #26
* 로그인/회원가입 인증 로직 구현, 보안성 강화를 위한 3x3 퍼즐 Captcha, 유저 대표 칭호 시스템 및 UI/UX 테마 통일을 완료했습니다.

---

## 🛠️ 주요 변경 사항

### 1. 백엔드 (NestJS & Prisma)
- **로그인 & JWT 인증 API 구현 (`POST /auth/login`)**
  - bcrypt 기반 비밀번호 검증 및 `JwtModule`을 통한 Access Token 발급
- **유효성 검사 강화 (`SignupDto`)**
  - 닉네임 길이 제한(2~10자) 및 특수문자 제한 패턴 추가 (`@Length`, `@Matches`)
- **DB 스키마 추가 (`schema.prisma` & `doc/DATABASE_SCHEMA.md`)**
  - `User` 모델에 `TITLE` (`DEFAULT '초급 슬라이더'`) 및 `IS_TITLE_SEEN` (`DEFAULT false`) 필드 추가
  - 최초 로그인 여부를 DB 기반으로 추적하여 계정당 1회 축하 팝업 보장 (IP/기기 변경 대응)

### 2. 프론트엔드 (React & Tailwind CSS)
- **회원가입/로그인 폼 강화 (`SignupPage.tsx`, `LoginPage.tsx`)**
  - 비밀번호 확인(`confirmPassword`) 및 일치 여부 검증
  - 제출 중 버튼 중복 입력 방지 (`isSubmitting`)
- **3x3 퍼즐 보안 인간검증 위젯 (`PuzzleCaptcha.tsx`)**
  - 로그인 버튼 클릭 시 3x3 퍼즐 팝업 모달 노출
  - 단방향 10단계 셔플 알고리즘으로 유저가 4~7회 유의미한 클릭으로 풀 수 있도록 설계
- **업적/칭호 축하 팝업 모달 (`TitleUnlockModal.tsx`)**
  - 최초 로그인 성공 시 황금빛 바운스 애니메이션 팝업(`🏆 NEW TITLE UNLOCKED!`) 노출
- **상단바 실시간 연동 및 더미 제거 (`Navbar.tsx`)**
  - 개발용 테스트 더미 유저 셀렉트 박스 완전 제거
  - `auth-change` 커스텀 이벤트를 활용해 새로고침 없이 실시간 로그인/로그아웃 상단바 업데이트 (`🟢 🏆 [초급 슬라이더] 닉네임 님`)
- **UI/UX 및 테마 통일**
  - `index.css` 및 `App.tsx` 전역 다크 모드(`bg-gray-900 text-white`) 적용

---

## 🧪 테스트 항목
- [x] 이메일/닉네임 중복 가입 및 유효성 검사 예외 처리 확인
- [x] 3x3 퍼즐 완성 전 로그인 처리 불가 확인
- [x] 최초 1회 칭호 축하 팝업 작동 및 이후 재로그인 시 팝업 건너뛰기 확인 (DB 연동)
- [x] Backend (`nest build`) 및 Frontend (`vite build`) 정상 빌드 완료
