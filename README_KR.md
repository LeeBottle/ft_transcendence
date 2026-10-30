_This project has been created as part of the 42 curriculum by byeolee, hjang, sanghul2._

# ft_transcendence

---

## 1. Description (프로젝트 개요)

### 1.1 Project Overview
ft_transcendence는 클래식 주사위 보드게임인 요트 다이스(Yacht Dice / 야추)를 현대적인 웹 기술로 재해석한 실시간 3D 멀티플레이어 웹 플랫폼입니다.

브라우저 환경에서 실시간 3D 그래픽(Three.js)으로 주사위의 역동적인 굴림 애니메이션을 감상할 수 있으며, WebSocket(Socket.io)을 기반으로 최대 4인이 동시에 참여하는 원격 대전 및 기대값 기반의 지능형 AI 대전을 지원합니다. 아울러 안전한 JWT/비밀번호 암호화 인증 체계, 슬라이더 퍼즐 캡차를 통한 인터랙티브 보안 UX, 전적 기록(Match History)과 리더보드, 칭호 해금/장착 게이미피케이션, 그리고 Windows 98 레트로 테마의 실시간 협업 화이트보드(그림판)를 완벽하게 통합 제공합니다.

---

### 1.2 Team Information (팀 정보 및 역할 분담)

본 프로젝트는 3인의 개발자가 각각 PO(Product Owner), PM(Project Manager), Tech Lead(Technical Lead)의 핵심 책무를 분담함과 동시에 전원이 Full-Stack Developer로서 프론트엔드와 백엔드 구현에 적극 참여하였습니다.

#### 1) sanghul2
- Assigned Role: PO (Product Owner) / Full-Stack Developer
- Responsibilities:
  - 제품 비전 수립 및 형태 설계: 프로젝트의 전반적인 서비스 기획, 사용자 스토리 정의, 시스템 초기 뼈대 및 디자인 아키텍처의 큰 틀 확립
  - 인증 및 보안 UX (feature-auth 도메인 개발):
    - NestJS Passport 및 JWT 기반의 안전한 사용자 인증/인가 파이프라인 구축
    - bcryptjs 기반 비밀번호 단방향 암호화 및 유효성 검사 DTO 체계 수립
    - 봇 방지 및 인터랙티브 인증 경험을 위한 슬라이더 퍼즐 캡차(PuzzleCaptcha.tsx) 설계 및 구현
  - 사용자 프로필 & 게이미피케이션(칭호) 시스템:
    - 회원가입 및 조건 달성 시 해금되는 칭호(Titles) 시스템(TitlesPage.tsx, TitleUnlockModal.tsx, ProfilePage.tsx) 및 DB 모델링
  - 실시간 레트로 협업 그림판:
    - Windows 98 테마의 실시간 협업 화이트보드(Win98Canvas.tsx, DrawingPage.tsx, drawing.gateway.ts) 소켓 게이트웨이 및 프론트엔드 구축
  - 표준 문서화 총괄:
    - 평가 및 협업을 위한 20여 종의 상세 기술 명세서(doc/ 내 API, 아키텍처, 게임 로직, 소켓, DB 스키마 등) 체계적 작성 및 유지보수

#### 2) byeolee
- Assigned Role: PM (Project Manager / Scrum Master) / Full-Stack Game Architect & Developer
- Responsibilities:
  - 마일스톤 수립 및 일정 관리: 스프린트 주기 설정, 개발 마일스톤 수립, GitHub 이슈 및 칸반 보드를 통한 작업 진척도 트래킹 및 블로커(장애 요소) 신속 해결
  - 실시간 게임 도메인 (Yachat 도메인 개발):
    - 프로젝트의 핵심 콘텐츠인 실시간 요트 다이스(Yacht Dice) 엔진 총괄 설계 및 구현
    - NestJS WebSocket(yacht.gateway.ts) 기반 룸 상태 머신(Room State Machine), 실시간 턴 진행 및 플레이어 액션 동기화 로직 구축
    - 요트 다이스 공식 12개 족보(Aces~Yacht, Choice, Full House 등) 자동 판정 및 보너스 점수(35점) 산출 엔진(yacht.score.ts, yachtScore.ts) 개발
  - 3D 그래픽스 & 인터랙티브 UI:
    - Three.js 및 React Three Fiber(@react-three/fiber)를 활용한 실시간 3D 주사위 롤링 애니메이션 및 물리 효과 구현(Dice3DCanvas.tsx).
    - 반응형 스코어보드 UI(YachtBoard.tsx), 게임 로비 및 방 생성/참가 모달(LobbyPage.tsx, GameMakePage.tsx, GameRoomPage.tsx) 개발
  - 지능형 AI 대전 엔진 (yacht.ai.ts):
    - 1~4인 게임 내 빈 슬롯을 채우는 AI 상대 개발
    - 난이도별(NOVICE, INTERMEDIATE, MASTER) 주사위 재굴림(Keep) 및 최적 스코어 기대값 산출 알고리즘 구현

#### 3) hjang
- Assigned Role: Tech Lead (Technical Lead / Architect) / Database & DevOps Lead / Full-Stack Developer
- Responsibilities:
  - 초기 기술 검증 (PoC) 및 아키텍처 수립 (hjang_fullstack 주도):
    - Docker Desktop 환경에서 PostgreSQL, NestJS, React 간의 컨테이너화 및 데이터 파이프라인 흐름을 입증하는 엔드투엔드 PoC 성공적 구축.
    - 모듈형 시스템 아키텍처 및 공통 코딩 컨벤션, 디렉토리 구조 가이드라인 정의.
  - 데이터베이스 엔진 고도화 및 최적화:
    - 데이터베이스 엔진을 기존 PostgreSQL 15에서 최신 PostgreSQL 16(postgres:16-alpine)으로 성공적 상향 마이그레이션.
    - 한국 표준시 타임존(TZ=Asia/Seoul, PGTZ=Asia/Seoul) 완벽 동기화 및 쿼리 안정성 보장.
    - Prisma ORM 5 스키마(schema.prisma) 통합 설계(User, Room, MatchHistory, MatchParticipant 관계 정의) 및 무결성 보장.
  - 인프라 & DevOps 최적화:
    - Nginx 리버스 프록시(Port 8080) 구성 및 단일 명령어(docker compose up --build) 기반의 컨테이너 오케스트레이션 완성.
    - Cloudflare Tunnel(cloudflared) 컨테이너 구성을 통한 외부 실시간 테스트 환경 지원.
    - 개행 문자(CRLF/LF) 호환성 및 빌드 캐시 최적화.
  - 통합 전적 및 랭킹 시스템 개발:
    - 경기 종료 후 전적 영속화(MatchHistory, MatchParticipant) 및 승률/순위 집계 리더보드(RankingPage.tsx, MatchHistoryPage.tsx) 프론트엔드/백엔드 연동.

---

### 1.3 Project Management (프로젝트 관리)

#### 작업 조직 방식 (Work Organization)
- 도메인 중심의 모듈 분업:
  - 인증/보안/기획(sanghul2), 게임엔진/3D/소켓(byeolee), 인프라/DB/PoC(hjang)로 전문 영역을 명확히 분장하여 초기 병목을 차단
- 단계별 통합 전략 (Staged Merge):
  - 개별 브랜치에서 기능 검증 완료 후, 상세 단계별 통합 가이드(merge.txt)를 수립하여 DB 업그레이드 -> 스키마 통합 -> 백엔드 모듈 결합 -> 프론트엔드 라우팅 통합의 순서로 안전하게 단일 merge 시스템 완성

#### 프로젝트 관리 도구 (Management Tools)
- GitHub:
  - GitHub Issues: 기능 구현 명세, 버그 리포트, 기술 스택 변경 건을 이슈 단위로 발행하여 추적
  - GitHub Projects / Milestones: PM(byeolee)의 주도하에 스프린트 마일스톤을 설정
  - GitHub Pull Requests & Code Review: 코드 변경 사항에 대해 최소 1인 이상의 동료 검토를 거쳐 메인 브랜치에 반영

#### 커뮤니케이션 채널 (Communication Channels)
- GitHub Communication (Issues, PR 코멘트, Discussions):
  - 코드베이스 변경 이력과 직접 연관된 기술적 토론, 아키텍처 제안, 버그 원인 분석을 이슈 및 PR 스레드에 기록하여 히스토리 영구 보존
- Slack:
  - 실시간 비동기 소통, 일일 스탠드업 공유, GitHub Webhook을 통한 커밋/PR 알림 연동
  - 음성 및 화면 공유를 통한 실시간 트러블슈팅 및 정기 스프린트 회의 진행

---

### 1.4 Directory Structure & File Architecture (폴더 구조 및 파일 아키텍처)

프로젝트 루트 및 서브모듈의 전체 디렉토리 트리는 다음과 같습니다.

```text
merge/
├── .env.example                  # 환경 변수 템플릿 (DB, JWT, 포트 등)
├── .env                          # 로컬 실행용 환경 변수 파일 (Git 무시)
├── docker-compose.yml            # 전체 5개 컨테이너(DB, 백, 프론트, Nginx, Tunnel) 오케스트레이션
├── Makefile                      # up, down, re, clean 등 간편 실행 명령어 스크립트
├── start.sh                      # 컨테이너 시작 헬퍼 셸 스크립트
├── nginx/
│   └── default.conf              # Nginx 리버스 프록시 및 정적/동적 라우팅 설정 (Port 80 -> 8080)
│
├── backend/                      # NestJS 백엔드 애플리케이션
│   ├── Dockerfile                # 백엔드 도커 이미지 빌드 파일
│   ├── package.json              # 백엔드 의존성 (NestJS 10, Prisma 5, Socket.io, bcryptjs 등)
│   ├── tsconfig.json             # TypeScript 컴파일러 설정
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma ORM 데이터베이스 모델링 명세
│   │   └── seed.ts               # 초기 테스트 더미 유저(a, b, c, d) 시드 스크립트
│   └── src/
│       ├── main.ts               # 백엔드 엔트리포인트 (CORS 설정, 전역 파이프라인, 포트 바인딩)
│       ├── app.module.ts         # 루트 모듈 (AuthModule, YachtModule, PrismaModule 결합)
│       ├── app.controller.ts     # 서버 상태 확인용 헬스체크 컨트롤러
│       ├── drawing.gateway.ts    # 실시간 Win98 그림판 WebSocket Gateway
│       ├── prisma/
│       │   ├── prisma.module.ts  # PrismaService를 전역 제공하는 모듈
│       │   └── prisma.service.ts # PrismaClient 인스턴스 생명주기 관리 서비스
│       ├── auth/                 # 사용자 인증 및 프로필/칭호 도메인 모듈
│       │   ├── auth.module.ts    # JwtModule, Passport 설정 및 의존성 주입
│       │   ├── auth.controller.ts# 회원가입, 로그인, 칭호 해금/수정, 프로필 수정 REST API
│       │   ├── auth.service.ts   # 비즈니스 로직 (비밀번호 해싱, JWT 발급, 칭호 검증)
│       │   └── dto/              # 요청 유효성 검증 DTO 객체들
│       │       ├── signup.dto.ts
│       │       ├── login.dto.ts
│       │       ├── claim-title.dto.ts
│       │       └── update-title.dto.ts
│       └── Yacht/                # 요트 다이스 핵심 게임 도메인 모듈
│           ├── yacht.module.ts   # 요트 다이스 모듈 정의
│           ├── yacht.controller.ts# 룸 CRUD, 대기실 레디, 인게임 롤/홀드/스코어, 전적 API
│           ├── yacht.service.ts  # 게임 룸 상태 머신, 라운드 관리, 턴 진행, 전적 영속화
│           ├── yacht.gateway.ts  # 실시간 게임 진행 및 룸 동기화 WebSocket Gateway
│           ├── yacht.score.ts    # 12가지 족보 계산 및 상단 보너스(35점) 판정 순수 함수
│           └── yacht.ai.ts       # NOVICE, INTERMEDIATE, MASTER 3단계 AI 기대값 의사결정 엔진
│
├── frontend/                     # React 18 + Vite 프론트엔드 애플리케이션
│   ├── Dockerfile                # 프론트엔드 도커 이미지 빌드 파일
│   ├── package.json              # 프론트엔드 의존성 (React 18, Vite, Three.js, R3F, Tailwind 등)
│   ├── vite.config.ts            # Vite 번들러 설정 (포트 5173, 호스트 개방)
│   ├── tailwind.config.js        # Tailwind CSS 테마 및 유틸리티 설정
│   └── src/
│       ├── main.tsx              # 프론트엔드 렌더링 엔트리포인트 (React DOM)
│       ├── App.tsx               # 클라이언트 사이드 라우터(React Router) 및 네비게이션 가드
│       ├── index.css             # Tailwind 전역 스타일 및 커스텀 스크롤바/레트로 스타일
│       ├── context/
│       │   └── ThemeContext.tsx  # 앱 테마 상태 관리 컨텍스트
│       ├── components/           # 재사용 가능한 UI 컴포넌트들
│       │   ├── Navbar.tsx        # 상단 네비게이션 바 (로그인 상태, 현재 칭호 표시)
│       │   ├── PuzzleCaptcha.tsx # 슬라이더 조각 맞추기 퍼즐 캡차 컴포넌트
│       │   ├── TitleUnlockModal.tsx # 신규 칭호 달성 시 축하 팝업 모달
│       │   └── Win98Canvas.tsx   # Windows 98 테마의 실시간 협업 화이트보드 캔버스
│       ├── pages/                # 페이지 라우트 컴포넌트들
│       │   ├── HomePage.tsx      # 메인 대시보드 및 게임 시작 인트로 페이지
│       │   ├── LoginPage.tsx     # 로그인 페이지 (슬라이더 캡차 통합)
│       │   ├── SignupPage.tsx    # 회원가입 페이지
│       │   ├── ProfilePage.tsx   # 마이페이지 (아바타 변경, 정보 수정, 칭호 장착)
│       │   ├── TitlesPage.tsx    # 칭호 도감 및 업적 해금 현황 페이지
│       │   ├── DrawingPage.tsx   # Win98 실시간 협업 그림판 페이지
│       │   ├── MatchHistoryPage.tsx# 유저별 최근 대전 전적 히스토리 페이지
│       │   └── RankingPage.tsx   # 승률 및 점수 기반 글로벌 리더보드 순위 페이지
│       └── Yacht/                # 요트 다이스 전용 프론트엔드 컴포넌트들
│           ├── Dice3DCanvas.tsx  # Three.js 3D 주사위 롤링 애니메이션 및 물리 뷰어
│           ├── YachtBoard.tsx    # 12가지 족보 스코어보드 표 및 턴 기입 인터랙션
│           ├── LobbyPage.tsx     # 게임 로비 메인 화면
│           ├── LobbyRoomChoice.tsx# 게임 룸 목록 탐색 및 필터링 컴포넌트
│           ├── GameMakePage.tsx  # 게임 방 생성 모달 (공개/비공개, 슬롯, AI 난이도 설정)
│           ├── GameRoomPage.tsx  # 대기실(레디/시작) 및 실시간 인게임 통합 화면
│           └── yachtScore.ts     # 클라이언트 사이드 즉각적인 점수 미리보기 판정기
│
└── doc/                          # 20여 종의 상세 표준 기술 문서
    ├── API_SPECIFICATION.md      # 백엔드 REST API 전체 명세
    ├── ARCHITECTURE.md           # 시스템 아키텍처 다이어그램 및 설계 원칙
    ├── DATABASE_SCHEMA.md        # 데이터베이스 엔티티 및 인덱스 상세 설계서
    ├── GAME_LOGIC_SPECIFICATION.md# 요트 다이스 규칙 및 점수 계산 수식 명세
    ├── WEBSOCKET_SPECIFICATION.md# 웹소켓 이벤트 프로토콜 명세서
    ├── TECH_STACK_BACKEND.md     # 백엔드 기술 스택 선정 근거
    ├── TECH_STACK_FRONTEND.md    # 프론트엔드 기술 스택 선정 근거
    └── TECH_STACK_DEVOPS.md      # 데브옵스 및 인프라 구축 보고서
```

---

### 1.5 Technical Stack (기술 스택)

#### Frontend
- React 18 & TypeScript:
  - 컴포넌트 재사용성과 타입 안정성을 극대화하여 복잡한 게임 UI 상태 관리 구축
- Vite:
  - 빠른 HMR(Hot Module Replacement)과 최적화된 프로덕션 빌드 환경 제공
- Tailwind CSS:
  - 유틸리티 우선(Utility-first) 스타일링으로 반응형 UI, 모달, 레트로 윈도우 스타일을 신속하게 구현
- Three.js & @react-three/fiber:
  - 캔버스 기반 3D 주사위 모델 렌더링, 쿼터니언 기반 회전 물리 애니메이션 연출
- Socket.io Client (socket.io-client):
  - 게임 룸 및 화이트보드 캔버스 실시간 양방향 웹소켓 이벤트 송수신

#### Backend
- NestJS 10 / 11 Framework:
  - 모듈러 아키텍처(AuthModule, YachtModule, PrismaModule)를 기반으로 확장성과 유지보수성이 뛰어난 백엔드 구축
- WebSocket Gateway (@nestjs/websockets, Socket.io):
  - 게임 룸 브로드캐스팅, 턴 타이머 동기화, 플레이어 Keep/Roll 상태 전파, 실시간 화이트보드 스트로크 중계
- Passport & JWT (@nestjs/jwt, @nestjs/passport):
  - 무상태(Stateless) 토큰 기반 사용자 인증 및 인가 가드 적용
- Bcrypt (bcryptjs):
  - 단방향 솔트 해싱을 통한 사용자 비밀번호 안전한 암호화 저장

#### Database & ORM
- PostgreSQL 16 (postgres:16-alpine):
  - Tech Lead(hjang)의 주도하에 도입된 최신 릴리즈 RDBMS로, 강화된 트랜잭션 처리와 신뢰성 확보. 타임존(Asia/Seoul) 일치 적용
- Prisma ORM 5:
  - 완벽한 TypeScript 타입 생성(Type-safe Client), 직관적인 스키마 모델링 및 마이그레이션 자동화

#### Infrastructure & DevOps
- Docker & Docker Compose:
  - postgres, backend, frontend, nginx, tunnel 서비스를 단일 명령어로 일괄 빌드 및 오케스트레이션
- Nginx (Reverse Proxy, Port 8080):
  - 클라이언트 단일 진입점(Reverse Proxy)으로서 프론트엔드 정적 파일 서빙 및 백엔드 REST API(/api), 웹소켓(/socket.io) 요청 라우팅 처리
- Cloudflare Tunnel (cloudflared):
  - 복잡한 포트포워딩 없이 외부 브라우저 환경에서 즉각적인 실시간 협업 및 평가 테스트 지원

---

### 1.6 Database Schema (데이터베이스 스키마)

#### 1) 관계 구조 (ERD Summary)
```text
[User] 1 ──────── 0..* [MatchParticipant] * ──────── 1 [MatchHistory]
  │
  └─────── 0..* (Host/Participant in Room)
```

#### 2) 엔티티 및 모델 명세

##### User (사용자 엔티티)
- id (String, UUID, PK): 고유 유저 식별자
- email (String, Unique): 로그인 이메일
- password (String): bcrypt 해싱된 비밀번호
- nickname (String, Unique): 인게임 표시 닉네임
- avatar (String?, Default: "🤖"): 유저 프로필 아바타 아이콘
- title (String?, Default: "초급 슬라이더"): 획득한 대표 칭호
- equippedTitle (String?, Default: "초급 슬라이더"): 현재 장착 중인 칭호
- unlockedTitles (String?): 쉼표로 구분된 해금된 칭호 목록
- isTitleSeen (Boolean, Default: false): 신규 칭호 해금 팝업 확인 여부
- createdAt / updatedAt (DateTime): 생성/수정 일시

##### Room (게임 방 및 슬롯 상태 엔티티)
- id (String, UUID, PK): 게임 방 고유 식별자
- title (String): 방 제목
- hostNickname (String): 방장 닉네임
- password (String?): 비공개 비밀번호 방 비밀번호 (선택)
- isPublic (Boolean, Default: true): 공개/비공개 여부
- currentPlayers (Int, Default: 1): 현재 참가 인원수
- maxPlayers (Int, Default: 2): 최대 인원수 (2~4인)
- isGameStart (Boolean, Default: false): 게임 진행 여부
- slot1Ready ~ slot4Ready (Boolean): 슬롯별 레디 상태
- slot2Open ~ slot4Open (Boolean): 슬롯 개방 여부
- slot2IsAi ~ slot4IsAi (Boolean): 해당 슬롯의 AI 참여 여부
- slot2AiLevel ~ slot4AiLevel (String, Default: "NOVICE"): AI 난이도 (NOVICE | INTERMEDIATE | MASTER)
- slot2Nick ~ slot4Nick (String?): 입장한 유저 닉네임

##### MatchHistory (경기 기록 엔티티)
- id (String, UUID, PK): 경기 기록 고유 식별자
- roomId (String): 진행되었던 방 식별자
- roomTitle (String): 방 제목
- gameType (String, Default: "MULTI"): 게임 모드 (MULTI | SINGLE_AI)
- totalRounds (Int, Default: 12): 총 진행 라운드 수
- winnerNickname (String): 최종 우승자 닉네임
- winnerScore (Int): 최종 우승 점수
- playedAt (DateTime, Default: now()): 경기 종료 일시

##### MatchParticipant (경기별 참가자 점수 상세)
- id (String, UUID, PK): 식별자
- matchId (String, FK ➔ MatchHistory.id): 해당 경기 외래키
- nickname (String): 참가자 닉네임
- isAi (Boolean): AI 여부
- rank (Int): 최종 순위 (1위, 2위...)
- totalScore (Int): 최종 총점

---

### 1.7 Features List & Deep Dive (기능 목록 및 세부 명세)

아래 표는 구현된 전체 핵심 기능 요약입니다. 각 기능의 세부 규칙, 사용 기술, 코드 구조는 하단 상세 절에서 다룹니다.

| 대분류 | 세부 기능명 | 담당자 | 기능 설명 |
| :--- | :--- | :--- | :--- |
| 인증/보안 | 회원가입 & 로그인 | sanghul2 | JWT 토큰 발급 및 유효성 검사, bcrypt 암호화, 이메일/닉네임 중복 체크 |
| 인증/보안 | 슬라이더 퍼즐 캡차 | sanghul2 | Canvas 기반 조각 맞추기 퍼즐을 통과해야 로그인이 완료되는 인터랙티브 봇 방지 UX |
| 프로필/보상 | 프로필 & 칭호 관리 | sanghul2 | 아바타 변경, 칭호 해금 조건 달성 시 축하 모달 팝업 및 대표 칭호 장착 기능 |
| 협업 툴 | Win98 실시간 화이트보드 | sanghul2 | 레트로 윈도우 스타일 실시간 그림판, 다중 사용자 붓 스트로크 및 캔버스 초기화 동기화 |
| 게임 핵심 | 3D 주사위 롤링 연출 | byeolee | Three.js/@react-three/fiber 기반 3D 다이스 렌더링, 굴림 물리 효과 및 멈춤 판정 |
| 게임 핵심 | 12개 족보 판정 엔진 | byeolee | Yacht, Full House, Large Straight 등 점수 공식 판정 및 상단 보너스(35점) 자동 계산 |
| 게임 룸 | 로비 & 방 생성/참가 | byeolee | 공개/비공개방, 슬롯 수(2~4인) 조절, 비밀번호 잠금 방, 준비 상태 토글 및 게임 시작 |
| 게임 AI | 기대값 기반 AI 상대 | byeolee | NOVICE, INTERMEDIATE, MASTER 난이도별 주사위 Keep 결정 및 최적 카테고리 기입 엔진 |
| 인프라 | PostgreSQL 16 업그레이드 | hjang | DB 엔진을 16-alpine으로 상향 적용, 서울 표준시 동기화 및 쿼리 신뢰성 강화 |
| 인프라 | Docker & Nginx 통합 | hjang | 프론트/백/DB/리버스프록시 단일 compose 구성 및 포트 라우팅, 터널 연동 |
| 통계/전적 | 전적 히스토리 & 랭킹 | hjang | 경기 종료 시 승패/점수 영속화, 유저별 승률/평균 점수 및 전체 리더보드 순위 제공 |

---

#### 1.7.1 인증 및 보안 (Authentication & Security)
- 상세 동작 원리:
  - 회원가입 시 이메일 형식 검증, 비밀번호 유효성 검사(최소 길이 등), 닉네임 중복 여부를 백엔드(AuthService)에서 확인
  - 비밀번호는 bcryptjs 라이브러리를 사용하여 salt round 10으로 단방향 솔트 해싱되어 DB(User 테이블)에 안전하게 저장
  - 로그인 성공 시 서버는 payload(sub: user.id, email, nickname)를 담은 무상태 JWT 액세스 토큰을 발급하며, 클라이언트는 이를 localStorage에 보관하여 Authorization 헤더(Bearer 토큰)로 요청을 전송
- 사용 기술:
  - NestJS, Passport, @nestjs/jwt, bcryptjs, class-validator
- 관련 코드 구조:
  - backend/src/auth/auth.controller.ts: post signup, post login, get me
  - backend/src/auth/auth.service.ts: signup(), login(), validateUser()
  - backend/src/auth/dto/signup.dto.ts, login.dto.ts
  - frontend/src/pages/SignupPage.tsx, LoginPage.tsx

#### 1.7.2 인터랙티브 슬라이더 퍼즐 캡차 (Slider Puzzle Captcha)
- 상세 동작 및 판정 규칙:
  - 봇의 자동 로그인을 방어하고 즐거운 사용자 경험을 제공하기 위해 로그인 시 인터랙티브 캡차가 작동
  - HTML5 Canvas 2D API를 활용하여 배경 이미지 위에 랜덤한 위치(x: 100~300px, y: 30~150px)에 베지어 곡선(bezierCurveTo)을 활용한 직소 퍼즐 모양의 구멍(음각)을 뚫음
  - 동시에 동일한 형태의 퍼즐 조각(양각)을 별도 캔버스 레이어에 추출
  - 사용자가 마우스 드래그 또는 터치 이벤트로 하단 슬라이더 바를 조작하여 퍼즐 조각을 빈 공간에 정확히 일치
  - 판정 기준: 슬라이더를 놓았을 때 실제 타겟 x좌표와의 오차가 5픽셀 이내(Math.abs(sliderX - targetX) <= 5)인 경우에만 캡차 통과로 인정
  - 통과 시 초급 슬라이더 칭호 해금 트리거가 작동
- 사용 기술:
  - React, HTML5 Canvas 2D Context, CSS Drag & Drop Handler
- 관련 코드 구조:
  - frontend/src/components/PuzzleCaptcha.tsx
  - frontend/src/pages/LoginPage.tsx

#### 1.7.3 프로필 및 칭호 게이미피케이션 (Titles & Gamification)
- 상세 규칙 및 시스템 구조:
  - 칭호 상태는 세 가지로 구분되어 관리
    - 획득한 대표 칭호(`title`): 유저 생성 시 기본 지급되는 최초 칭호 (기본값: '초급 슬라이더')
    - 현재 인게임 및 프로필에 노출되는 장착 칭호(`equippedTitle`): 상단 네비게이션, 프로필, 랭킹 리더보드에 실시간 노출
    - 쉼표로 구분된 해금 완료 칭호 문자열(`unlockedTitles`): 유저가 업적 달성을 통해 획득한 모든 칭호 목록을 누적 보관 (콤마 단위 구분)
  - 프로젝트 내 구현된 전체 칭호 목록 (총 7종):
    - 초급 슬라이더 (`SLIDER_BEGINNER`): 회원가입 및 슬라이더 퍼즐 캡차 최초 인증 성공 시 기본 해금
    - 요트 마스터 (`YACHT_MASTER`): 인게임에서 주사위 5개가 일치하는 Yacht(50점) 최고 족보를 기록하고 게임 종료 시 해금
    - 첫 승리의 주역 (`FIRST_VICTORY`): 멀티플레이 대전(2인 이상)에서 최초 1위 달성 또는 상대 기권 시 해금
    - 불꽃 연승 (`WIN_STREAK`): 멀티플레이 게임에서 연속 3연승(최근 경기 3연속 1위) 달성 시 해금
    - AI 브레이커 (`AI_BREAKER`): AI 봇이 포함된 대결에서 인간 플레이어가 최종 1위 승리 시 해금
    - 스피드 러너 (`SPEED_RUNNER`): 로그인 퍼즐 캡차를 3초 이내에 초고속으로 통과 시 실시간 해금
    - 거리의 화가 (`PICASSO`): Windows 98 실시간 협업 화이트보드(그림판)에서 20회 이상 드로잉 달성 시 해금
  - 해금 및 장착 인터랙션:
    - 신규 칭호가 해금되면 `isTitleSeen` 플래그가 `false`로 설정되어, 로그인 시 화면에 축하 폭죽 캔버스 팝업 모달(`TitleUnlockModal.tsx`)이 나타나며 즉시 장착 가능한 인터랙션 제공
    - 칭호 도감 페이지(`TitlesPage.tsx`)에서 전체 칭호의 해금 조건과 달성 여부를 확인하고, 보유 칭호를 클릭하여 자유롭게 장착/해제 토글 가능
- 사용 기술:
  - Prisma Client 트랜잭션, Tailwind CSS 모달 컴포넌트, HTML5 Canvas Confetti 애니메이션
- 관련 코드 구조:
  - backend/src/auth/auth.service.ts: claimTitle(), updateTitle(), updateProfile(), getMe()
  - backend/src/auth/dto/claim-title.dto.ts, update-title.dto.ts
  - backend/src/Yacht/yacht.service.ts: grantTitleToUser(), archiveGameMatch(), handlePlayerDisconnectOrForfeit()
  - frontend/src/pages/TitlesPage.tsx: 전체 칭호 도감(ALL_TITLES) 및 실시간 장착 UI
  - frontend/src/components/TitleUnlockModal.tsx: 신규 칭호 달성 축하 팝업 모달
  - frontend/src/pages/LoginPage.tsx: 스피드 러너 해금 트리거
  - frontend/src/components/Win98Canvas.tsx: 거리의 화가 해금 트리거

#### 1.7.4 Windows 98 테마 실시간 협업 화이트보드 (Collaborative Whiteboard)
- 상세 동작 및 동기화 규칙:
  - Windows 98의 클래식 그림판(Paint) UI를 레트로 감성으로 완벽히 재현한 실시간 협업 공간
  - 유저는 연필, 지우개 도구, 색상 팔레트, 선 굵기(1~30px)를 선택하여 캔버스에 사용 가능
  - 드로잉 이벤트는 마우스 이동 시 좌표 쌍(x0, y0, x1, y1)과 색상, 굵기 정보를 drawing:stroke 소켓 이벤트로 백엔드 게이트웨이에 전송
  - 서버(DrawingGateway)는 전송된 스트로크의 유효성(좌표 범위 0~800 x 0~450, 굵기, 색상 정규식)을 검증한 후, 발신자를 제외한 방 안의 모든 연결된 클라이언트에게 broadcast.emit으로 실시간 중계
  - 중간에 새로 접속한 유저도 기존 그림을 그대로 볼 수 있도록 서버 메모리에 최근 5,000개의 스트로크 배열을 보관하고, 접속 시(drawing:init) 일괄 전송
  - 전체 지우기(drawing:clear) 실행 시 모든 참가자의 캔버스가 동시에 초기화
- 사용 기술:
  - NestJS WebSocketGateway, Socket.io Server/Client, HTML5 Canvas
- 관련 코드 구조:
  - backend/src/drawing.gateway.ts
  - frontend/src/components/Win98Canvas.tsx
  - frontend/src/pages/DrawingPage.tsx

#### 1.7.5 Three.js 3D 주사위 롤링 물리 연출 (3D Dice Graphics)
- 상세 동작 및 동기화 기술:
  - WebGL 기반 3D 라이브러리인 Three.js 및 React Three Fiber(@react-three/fiber)를 사용하여 5개의 주사위를 완전한 3D 오브젝트로 렌더링
  - 주사위 롤링 버튼을 클릭하면 각 주사위마다 랜덤한 각속도 벡터(Angular Velocity)와 3축(x, y, z) 텀블링 애니메이션이 시작
  - 클라이언트-서버 간 상태 불일치(Desync)를 원천 차단하기 위해 결정론적 동기화 방식을 사용:
    - 서버에서 주사위 굴림 결과(1~6의 정수 눈금 5개)를 먼저 확정하여 클라이언트에 페이로드로 전송
    - 클라이언트의 3D 엔진은 굴림 애니메이션의 종료 단계에서 각 주사위의 타겟 면이 카메라를 향하도록 회전 쿼터니언(Quaternion)을 부드럽게 보정(Slerp 보간)하여 정지
  - 유저는 주사위를 개별 클릭하여 재굴림 시 고정할 주사위(Keep/Hold)를 지정 가능
- 사용 기술:
  - Three.js, @react-three/fiber, @react-three/drei
- 관련 코드 구조:
  - frontend/src/Yacht/Dice3DCanvas.tsx

#### 1.7.6 요트 다이스 12개 공식 족보 판정 엔진 (Yacht Score Engine)
- 상세 게임 규칙 및 점수 산정 공식:
  - 게임은 총 12라운드로 진행되며, 플레이어는 12가지 카테고리 중 매 라운드마다 하나를 선택해 점수를 기입
  - 주사위 굴림: 턴당 기본 1회 굴림 후, 최대 2회의 재굴림(총 3회) 기회
  - 킵(Keep)한 주사위는 유지되고 나머지 주사위만 다시 굴림
  - 12가지 족보 계산 규칙:
    1. Aces (Ones): 1의 눈금 합계 (최대 5점)
    2. Twos: 2의 눈금 합계 (최대 10점)
    3. Threes: 3의 눈금 합계 (최대 15점)
    4. Fours: 4의 눈금 합계 (최대 20점)
    5. Fives: 5의 눈금 합계 (최대 25점)
    6. Sixes: 6의 눈금 합계 (최대 30점)
    - 상단 보너스(Upper Bonus): 1번~6번 상단 항목의 총합이 63점 이상일 경우 보너스 점수 35점이 추가 부여됩니다.
    7. Choice: 5개 주사위 눈금의 단순 총합 (최대 30점)
    8. 4 of a Kind: 동일한 눈금이 4개 이상일 때 5개 주사위 전체 눈금의 합계
    9. Full House: 3개의 동일 눈금 + 2개의 동일 눈금 조합인 경우 5개 주사위 전체 눈금의 합계
    10. Small Straight: 4개의 연속된 눈금(1-2-3-4, 2-3-4-5, 3-4-5-6) 포함 시 고정 15점
    11. Large Straight: 5개의 연속된 눈금(1-2-3-4-5, 2-3-4-5-6)인 경우 고정 30점
    12. Yacht: 5개의 주사위 눈금이 모두 일치하는 경우 고정 50점
- 사용 기술:
  - TypeScript 순수 함수형 계산 모듈
- 관련 코드 구조:
  - backend/src/Yacht/yacht.score.ts: calculateScore(), isValidScore()
  - frontend/src/Yacht/yachtScore.ts: 클라이언트 즉시 미리보기 판정
  - frontend/src/Yacht/YachtBoard.tsx: 점수판 UI

#### 1.7.7 게임 룸 및 멀티플레이어 상태 머신 (Lobby & Room State Machine)
- 상세 동작 및 슬롯 규칙:
  - 방 생성 시 방 제목, 공개/비공개 여부, 비밀번호(비공개방 전용), 슬롯별 상태(참여 가능 슬롯 수 2~4인, AI 슬롯 여부, AI 난이도)를 자유롭게 설정 가능
  - 방장(Host)은 슬롯 1에 자동 배정되며, 슬롯 2~4는 입장하는 일반 플레이어(Human) 또는 방장이 추가한 봇(AI)으로 채워짐
  - 레디 시스템: 방장을 제외한 모든 참가 플레이어가 준비 완료(Ready) 상태여야만 방장의 게임 시작(Start) 버튼이 활성화
  - 인게임 상태 머신(Room State Machine):
    - 현재 턴 플레이어 인덱스(currentTurnPlayer) 관리
    - 라운드 카운터(1~12) 및 플레이어별 남은 굴림 횟수(rollsLeft: 기본 3)
    - 턴 종료 시 다음 유저로 턴 인계, 마지막 유저까지 완료 시 다음 라운드 진입
    - 12라운드 종료 시 최종 점수 집계 후 전적 DB 저장 및 우승자 판정
- 사용 기술:
  - NestJS WebSocketGateway, Room 기반 Socket.io 브로드캐스팅, REST API
- 관련 코드 구조:
  - backend/src/Yacht/yacht.controller.ts, yacht.service.ts, yacht.gateway.ts
  - frontend/src/Yacht/LobbyPage.tsx, GameMakePage.tsx, GameRoomPage.tsx

#### 1.7.8 3단계 지능형 AI 상대 엔진 (Intelligent AI Engine)
- 난이도별 의사결정 알고리즘:
  - NOVICE (초급 AI):
    - 주사위 재굴림 시 단순한 규칙(다수 눈금 우선 Keep)을 따르며, 일정 확률로 무작위 결정
    - 점수 기입 시 만족하는 족보 중 가장 낮은 점수부터 기입하거나, 0점 처리 시 덜 중요한 족보를 우선 희생
  - INTERMEDIATE (중급 AI):
    - 상단 항목(Aces~Sixes) 달성도를 면밀히 체크하여 상단 보너스(63점)를 노리도록 설계
    - 스트레이트 가능성(3개 연속 눈금 등)이 감지되면 재굴림 시 해당 주사위들을 적극적으로 유지
  - MASTER (마스터 AI):
    - 수학적 확률 기반의 기대 점수(Expected Value, EV) 산출 알고리즘을 사용
    - 남은 굴림 횟수와 주사위 5개의 순열 조합(6^5 = 7,776가지)에 대해 남은 미기입 카테고리의 획득 가능 점수 기댓값을 연산
    - 상단 보너스 획득에 기여할 확률 가중치(+35점 기댓값)를 고려하여 가장 손해가 적고 승률이 높은 최적의 Keep 및 카테고리 기입을 수행
- 사용 기술:
  - TypeScript 기반 휴리스틱 및 확률 기대값 수학 엔진
- 관련 코드 구조:
  - backend/src/Yacht/yacht.ai.ts: YachtAiEngine 클래스 (decideKeep(), decideCategory())

#### 1.7.9 전적 기록 및 글로벌 리더보드 (Match History & Leaderboard)
- 상세 동작 및 쿼리 규칙:
  - 12라운드가 종료되면 YachtService.finishGame()이 실행되어 Prisma 트랜잭션으로 MatchHistory 레코드를 생성하고, 참가자별 최종 점수와 순위를 MatchParticipant에 원자적으로 기록
  - 마이페이지/전적 페이지에서 유저 닉네임으로 조회 시 승리 횟수, 총 경기 수, 승률(Win Rate %), 평균 득점을 실시간 집계하여 반환
  - 리더보드(랭킹) 페이지에서는 전체 참가자 중 승리 횟수와 최고 점수를 기준으로 순위를 매겨 금/은/동메달 배지와 대표 칭호를 함께 노출
- 사용 기술:
  - PostgreSQL 16 집계 쿼리(Aggregate & GroupBy), Prisma ORM
- 관련 코드 구조:
  - backend/src/Yacht/yacht.service.ts: getUserMatchStats(), getLeaderboardRanking()
  - frontend/src/pages/MatchHistoryPage.tsx, RankingPage.tsx

---

### 1.8 Modules (선택 모듈 및 점수 계산)

본 프로젝트는 42 과제 요구 기준 점수인 14점을 대폭 상회하는 총 23점 상당의 모듈을 완성도 높게 구현하였습니다.

| 카테고리 | 모듈 구분 | 모듈명 | 배점 | 구현 내용 및 선정 사유 | 담당자 |
| :--- | :--- | :--- | :---: | :--- | :--- |
| Web | Major | 프론트엔드 & 백엔드 프레임워크 사용 | 2점 | 프론트엔드 React 18(Vite) 및 백엔드 NestJS 10/11 채택으로 강력한 컴포넌트 분리 및 모듈러 서버 아키텍처 실현 | hjang, byeolee, sanghul2 |
| Web | Major | WebSocket 기반 실시간 기능 구현 | 2점 | Socket.io 기반 실시간 게임 룸 턴 동기화 및 실시간 협업 화이트보드 스트로크 브로드캐스팅 구축 | byeolee, sanghul2 |
| Web | Major | 사용자 간 상호작용 시스템 | 2점 | 실시간 대기실/인게임 상호작용, 유저 프로필 조회, 온라인 상태 및 방 참가 인터랙션 | sanghul2, byeolee |
| Web | Minor | 데이터베이스 ORM 사용 | 1점 | Prisma ORM 5를 도입하여 완전한 타입 안정성(Type-safe) 쿼리 및 엔티티 마이그레이션 관리 | hjang |
| Web | Minor | 실시간 협업 기능 | 1점 | 레트로 Windows 98 테마의 실시간 협업 화이트보드(그림판)로 다자간 실시간 드로잉 공유 | sanghul2 |
| Gaming/UX | Major | 완전한 웹 기반 게임 구현 | 2점 | 정통 주사위 전략 게임 '요트 다이스(Yacht Dice)'의 12가지 공식 족보 판정 및 턴 기반 풀 매치 구현 | byeolee |
| Gaming/UX | Major | 원격 플레이어 (Remote players) | 2점 | 원격 클라이언트 간 네트워크 지연 처리, 실시간 턴 타이머 및 액션 동기화로 쾌적한 원격 게임 환경 제공 | byeolee |
| Gaming/UX | Major | 3인 이상 멀티플레이어 지원 | 2점 | 1대1 대전에 국한되지 않고 최대 4인의 유저가 한 방에서 동시에 대전할 수 있는 확장 슬롯 설계 | byeolee |
| Gaming/UX | Major | Three.js 고급 3D 그래픽 구현 | 2점 | Three.js 및 React Three Fiber를 사용해 3D 주사위 롤링, 그림자, 물리 시뮬레이션 및 카메라 연출 구현 | byeolee |
| Gaming/UX | Minor | 게임 커스터마이징 옵션 | 1점 | 2~4인 인원수 조절, 비밀번호 비공개방 설정, AI 슬롯 추가 및 난이도 지정 등 다양한 방 옵션 제공 | byeolee |
| Gaming/UX | Minor | 게이미피케이션 (칭호/보상) | 1점 | 조건부 칭호(초급 슬라이더 등) 해금/장착, 캡차 통과 리워드, 유저 리더보드 순위표 반영 | sanghul2, hjang |
| AI | Major | 게임용 AI 상대 도입 | 2점 | 남은 주사위와 족보의 기대값(Expected Value)을 수학적으로 계산하여 최적수를 두는 3단계 AI 엔진 탑재 | byeolee |
| User Mgmt | Major | 표준 사용자 관리 및 인증 | 2점 | JWT 기반 세션 관리, bcrypt 단방향 암호화, 아바타/닉네임 관리 및 프로필 페이지 제공 | sanghul2 |
| User Mgmt | Minor | 게임 통계 및 매치 히스토리 | 1점 | 모든 게임 결과를 DB에 기록하고, 개인 승률, 평균 점수, 최근 경기 전적 및 순위표 조회 제공 | hjang |

- 획득 점수 합계: 23점 (메이저 9개 × 2점 = 18점 / 마이너 5개 × 1점 = 5점)
- 과제 통과 기준(14점) 충족 및 보너스 점수(최대 5점) 완전 달성

---

### 1.9 Individual Contributions (개인별 상세 기여도)

#### 1) sanghul2 (PO / Full-Stack Developer)
- 상세 기여 내용:
  - 프로젝트 전체 비전 및 유저 플로우(User Journey) 기획, 요구사항 백로그 관리.
  - JWT 토큰 기반 인증/인가 가드 및 bcrypt 비밀번호 암호화 모듈 개발.
  - 봇 방지 및 인터랙티브 인증을 위한 슬라이더 퍼즐 캡차(PuzzleCaptcha.tsx) 직접 설계 및 구현.
  - 칭호 시스템(TitlesPage.tsx, TitleUnlockModal.tsx)과 유저 프로필 시스템 프론트/백엔드 구축.
  - Windows 98 테마의 실시간 협업 화이트보드(Win98Canvas.tsx, drawing.gateway.ts) 완성.
  - 프로젝트의 신뢰성을 보증하는 20개 이상의 표준 문서(doc/ 디렉토리) 전면 작성.
- 직면했던 과제 및 극복 과정:
  - 과제: 일반적인 텍스트 캡차는 사용자 경험을 저해하고 우회 위험이 컸음.
  - 해결: Canvas 2D API를 활용해 랜덤 곡선 퍼즐 조각을 생성하고, 마우스/터치 슬라이더 위치의 오차범위(±5px)를 백엔드와 유기적으로 검증하는 인터랙티브 퍼즐 캡차를 자체 제작하여 보안과 재미를 동시에 확보함.

#### 2) byeolee (PM / Full-Stack Game Architect & Developer)
- 상세 기여 내용:
  - 전체 개발 일정 마일스톤 수립, GitHub 이슈 및 칸반 보드 관리, 팀원 간 작업 조율.
  - 요트 다이스 메인 게임의 풀스택 아키텍처 총괄 (yacht.gateway.ts, yacht.service.ts, yacht.score.ts).
  - Three.js(@react-three/fiber) 기반의 3D 주사위 롤링 애니메이션 및 뷰어 캔버스 구현(Dice3DCanvas.tsx).
  - 12가지 공식 족보 판정 로직과 점수 계산표 인터랙션(YachtBoard.tsx) 개발.
  - 최대 4인 동시 지원 룸 생성/로비/슬롯 상태 머신(GameMakePage.tsx, GameRoomPage.tsx) 개발.
  - 3단계 난이도(NOVICE, INTERMEDIATE, MASTER)를 지원하는 지능형 AI 엔진(yacht.ai.ts) 설계.
- 직면했던 과제 및 극복 과정:
  - 과제: 웹소켓을 통한 4인 실시간 대전 시, 주사위 굴림 애니메이션의 종료 시점과 서버의 점수 판정 타이밍이 어긋나 클라이언트 간 상태 불일치가 발생하는 문제가 있었음.
  - 해결: 주사위의 물리 연산 결과(눈금)를 서버가 먼저 확정하여 페이로드로 전파하고, 클라이언트는 서버가 전달한 주사위 눈금으로 수렴하도록 회전 쿼터니언을 보정하는 결정론적 애니메이션 동기화 방식을 도입하여 해결함.

#### 3) hjang (Tech Lead / Database & DevOps Lead / Full-Stack Developer)
- 상세 기여 내용:
  - 프로젝트 초기 풀스택 PoC(hjang_fullstack) 구축을 통한 환경 검증 및 기술 표준 제시.
  - PostgreSQL 16(postgres:16-alpine) 상향 마이그레이션 주도 및 한국 표준시(Asia/Seoul) 최적화.
  - 세 브랜치의 스키마를 단일 Prisma 스키마(schema.prisma)로 완전 통합하고 외래키 및 인덱스 정비.
  - Nginx 리버스 프록시 및 Docker Compose 기반의 단일 명령어 빌드/실행 인프라 총괄.
  - 전적 히스토리(MatchHistory) 및 참가자 스냅샷(MatchParticipant) 엔티티 설계와 리더보드/통계 API 및 UI(MatchHistoryPage.tsx, RankingPage.tsx) 개발.
- 직면했던 과제 및 극복 과정:
  - 과제: 초기 버전(PostgreSQL 15)과 윈도우/리눅스 환경 차이에서 발생하던 타임존 불일치 및 컨테이너 빌드 시 개행 문자(CRLF) 충돌 문제 발생.
  - 해결: Dockerfile과 compose 파일에 TZ=Asia/Seoul을 명시하고, 최신 PostgreSQL 16 공식 알파인 이미지를 채택하여 엔진 호환성을 강화함. 또한 Git의 core.autocrlf false 적용 가이드와 안전한 단계별 마이그레이션 가이드라인(merge.txt)을 수립하여 단 한 번의 빌드 실패 없이 성공적인 최종 통합을 완수함.

---

## 2. API & WebSocket Specifications (API 및 통신 명세)

### 2.1 REST API Specification
모든 API는 Nginx 리버스 프록시를 통해 /api 또는 백엔드 포트(3000)로 라우팅됩니다.

| Method | Endpoint | Headers / Payload | Response | 기능 설명 |
| :--- | :--- | :--- | :--- | :--- |
| POST | /auth/signup | { email, password, nickname } | { message, user } | 회원가입 (비밀번호 암호화 저장) |
| POST | /auth/login | { email, password } | { accessToken, user } | 로그인 및 JWT 토큰 발급 |
| GET | /auth/me | Authorization: Bearer {token} | User 객체 | 현재 로그인된 사용자 정보 조회 |
| GET | /auth/user/:nickname | - | User 객체 | 닉네임 기반 유저 프로필 조회 |
| POST | /auth/claim-title | { title, nickname } | { message, user } | 칭호 해금 조건 충족 시 등록 |
| PATCH | /auth/title | { title, nickname } | { message, user } | 대표 칭호 장착 및 변경 |
| PATCH | /auth/profile | { nickname, avatar, newPassword } | { message, user } | 유저 프로필 정보 및 비밀번호 수정 |
| POST | /yacht/rooms | { title, isPublic, password, slots }| 생성된 Room 객체 | 새로운 게임 방 생성 (2~4인, AI 슬롯) |
| GET | /yacht/rooms | - | Room[] 배열 | 현재 생성된 방 목록 조회 |
| GET | /yacht/rooms/:id | - | Room 객체 | 특정 방 상세 정보 및 슬롯 조회 |
| POST | /yacht/rooms/:id/join | { nickname } | 갱신된 Room 객체 | 해당 방의 빈 슬롯에 참가 |
| POST | /yacht/rooms/:id/leave| { nickname } | { message } | 방 퇴장 처리 |
| POST | /yacht/rooms/:id/ready| { nickname } | { slot, isReady } | 슬롯 레디 상태 토글 |
| GET | /yacht/rooms/:id/game | - | GameState 객체 | 현재 진행 중인 게임 턴/점수 상태 조회 |
| POST | /yacht/rooms/:id/game/start | - | GameState 객체 | 방장의 게임 시작 실행 |
| POST | /yacht/rooms/:id/game/roll | { nickname, held: boolean[] } | { dice, rollsLeft } | 주사위 굴림 (Keep 주사위 제외 롤링) |
| POST | /yacht/rooms/:id/game/hold | { nickname, held: boolean[] } | { held } | 주사위 Keep 상태 업데이트 |
| POST | /yacht/rooms/:id/game/score| { nickname, category } | GameState 객체 | 카테고리 점수 기입 및 턴 넘김 |
| GET | /yacht/matches/user/:nickname | - | { totalMatches, wins, winRate, history } | 개인 전적 및 최근 매치 조회 |
| GET | /yacht/ranking | - | LeaderboardUser[] | 승리 수/점수 기준 글로벌 랭킹 |

### 2.2 WebSocket Events (실시간 통신 명세)

#### 1) 실시간 화이트보드 (DrawingGateway)
- 연결 경로: ws://localhost:8080/socket.io
- drawing:init (Server ➔ Client): 최초 연결 시 최근 저장된 5,000개 스트로크 배열 일괄 전송
- drawing:stroke (Client ➔ Server): 신규 드로잉 좌표(x0, y0, x1, y1, color, width) 전송
- drawing:stroke (Server ➔ Broadcast): 다른 모든 클라이언트에 해당 스트로크 실시간 중계
- drawing:clear (Client ➔ Server ➔ Broadcast): 캔버스 전체 지우기 동기화

#### 2) 요트 다이스 게임 (YachtGateway)
- yacht:room_updated: 방 슬롯 상태, 유저 입장/퇴장, 레디 상태 변경 브로드캐스팅
- yacht:game_started: 게임 시작 알림 및 첫 라운드 주사위 셋업
- yacht:dice_rolled: 주사위 롤링 결과 및 잔여 롤 횟수 동기화
- yacht:turn_changed: 턴 교체 및 다음 플레이어 지정 알림
- yacht:game_finished: 12라운드 종료 및 최종 스코어/우승자 발표

---

## 3. Evaluator's Guide (평가자를 위한 5분 퀵 패스 & 검증 가이드)

평가 시 프로젝트의 정상 동작과 요구사항 충족 여부를 가장 빠르고 확실하게 검증할 수 있는 단계별 시나리오입니다.

### 3.1 사전 확인 사항
1. 브라우저: 최신 Google Chrome을 실행하고 F12(개발자 도구) 콘솔 탭을 엽니다.
2. 콘솔 클린 정책: 모든 과정에서 빨간색 에러(Uncaught Exception 등)가 발생하지 않는지 확인

### 3.2 단계별 검증 시나리오 (5-Minute Quick Pass)
1. 단일 명령어로 프로젝트 구동:
   - 터미널에서 `docker compose up --build` 실행 후 모든 컨테이너가 정상 구동되는지 확인
   - 브라우저에서 `http://localhost:8080` 접속
2. 회원가입 및 슬라이더 캡차 테스트:
   - 상단 네비게이션에서 회원가입(Signup) 클릭 후 계정 생성
   - 로그인(Login) 화면으로 이동하여 정보 입력 후 슬라이더 퍼즐 캡차를 드래그하여 정위치에 맞춤
   - 캡차 통과 성공 후 로그인 완료 확인
3. 칭호 해금 및 마이페이지 확인:
   - 로그인 직후 '초급 슬라이더' 칭호 해금 축하 팝업 확인
   - 마이페이지(Profile) 및 칭호 도감(Titles)에서 아바타 변경 및 칭호 장착 확인
4. 요트 다이스 방 생성 및 AI 상대 추가:
   - 게임 로비(Lobby)로 이동 후 '방 만들기' 클릭
   - 2인 방을 선택하고 슬롯 2에 'AI 상대(MASTER 난이도)'를 추가한 후 방 생성
5. 3D 주사위 롤링 및 인게임 진행:
   - 게임 시작 후 3D 주사위가 부드럽게 굴러가는 애니메이션 확인
   - 주사위를 클릭하여 Keep 설정 후 재굴림(최대 3회) 테스트
   - 스코어보드에서 카테고리(예: Aces, Yacht 등)를 선택하여 점수 반영 및 턴이 AI로 넘어가는지 확인
   - AI가 계산된 기대값에 따라 스스로 주사위를 굴리고 점수를 기입하는 과정 확인
6. 전적 및 랭킹 확인:
   - 게임 종료 후 전적(Match History) 페이지에서 방금 진행된 게임 기록 확인
   - 랭킹(Ranking) 페이지에서 승률 및 순위표 업데이트 확인
7. 레트로 협업 그림판(Whiteboard) 테스트:
   - 새 탭을 하나 더 띄워 동일 주소 접속
   - 상단 메뉴의 그림판(Drawing)으로 이동하여 한쪽 탭에서 그림을 그렸을 때 다른 탭에 지연 없이 실시간 브로드캐스팅되는지 확인

---

## 4. Instructions (설치 및 실행 방법)

### 4.1 Prerequisites (사전 요구사항)
- Docker Desktop (Windows / macOS) 또는 Docker Engine & Docker Compose (Linux)
- Git
- 웹 브라우저: 최신 안정 버전의 Google Chrome 권장

### 4.2 Environment Configuration (.env 설정)
리포지토리 루트의 .env.example 파일을 복사하여 .env 파일을 생성

```bash
cp .env.example .env
```

.env 파일 내용 예시:
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=transcendence
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/transcendence?schema=public

# Backend
PORT=3000
JWT_SECRET=super_secret_jwt_key_ft_transcendence_2026

# Timezone
TZ=Asia/Seoul
PGTZ=Asia/Seoul
```

### 4.3 Execution (단일 명령어로 실행)
프로젝트는 컨테이너화되어 있으므로 단 한 줄의 명령어 로 전체 서비스를 빌드하고 구동 가능:

```bash
docker compose up --build
```

백그라운드에서 실행하려면:
```bash
docker compose up -d --build
```

실행 중인 서비스 종료:
```bash
docker compose down
```

### 4.4 Access & Verification (접속 및 확인)
- 웹 서비스 접속: http://localhost:8080 (Nginx 리버스 프록시를 통해 접근)
- 백엔드 직접 접속 (선택): http://localhost:3000
- 데이터베이스 직접 접속 (선택): localhost:5432

---

## 5. Troubleshooting Guide (문제 해결 가이드)

### 5.1 포트 충돌이 발생하는 경우 (8080, 3000, 5432)
- 증상: `bind: address already in use` 오류와 함께 컨테이너가 시작되지 않음
- 원인: 로컬 머신에 기존 PostgreSQL, Node.js 또는 웹 서버가 해당 포트를 이미 점유하고 있음
- 조치 방법:
  ```bash
  # 점유 중인 프로세스 확인 (Windows PowerShell)
  netstat -ano | findstr 8080
  netstat -ano | findstr 5432
  # 해당 PID 종료 또는 docker-compose.yml의 포트 매핑을 임의 변경
  ```

### 5.2 데이터베이스 스키마 초기화 및 클린 재시작이 필요한 경우
- 증상: DB 스키마 충돌 또는 마이그레이션 불일치 발생 시
- 조치 방법:
  ```bash
  # 볼륨을 포함하여 완전 삭제
  docker compose down -v
  # 캐시 없이 재빌드 실행
  docker compose up --build
  ```

### 5.3 윈도우 환경 개행 문자(CRLF vs LF) 오류
- 증상: `\r: command not found` 또는 Nginx 설정 파일 파싱 에러
- 조치 방법:
  - Git Bash에서 `git config --global core.autocrlf false` 설정 적용
  - VS Code에서 `start.sh`, `Dockerfile`, `nginx/default.conf`의 우측 하단 개행 설정을 LF로 변경 후 저장

---

## 6. Resources (참고자료 및 AI 활용 내역)

### 6.1 Documentation & References
- NestJS Official Documentation: https://docs.nestjs.com
- Prisma ORM Documentation: https://www.prisma.io/docs
- Three.js & React Three Fiber: https://threejs.org, https://docs.pmnd.rs/react-three-fiber
- Socket.io Documentation: https://socket.io/docs/v4
- Tailwind CSS: https://tailwindcss.com/docs
- Official Yacht Dice Rules: 클래식 요트 다이스 점수 판정 규칙 및 공식 족보 체계

### 6.2 AI Usage Disclosure (AI 사용 내역 명시)
과제 규정(Chapter I: AI Instructions)에 따라 본 프로젝트에서의 AI 도구 활용 내역을 명시합니다.

- 영어 번역 사용:
  - 영문 서브젝트 문서(en.subject.pdf) 및 기술 문서, README 작성 과정에서의 영문 번역 및 어휘 표현 검토에 AI 도구를 활용하였습니다.
  - 생성된 번역 결과물은 팀원들이 직접 검토 및 교정하여 프로젝트 요구사항과 일치하도록 확인 후 반영하였습니다.
