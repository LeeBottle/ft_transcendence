# 🛠️ 기술 스택 상세 설명: 1. 백엔드 (Backend)

`ft_transcendence` 백엔드는 NestJS 프레임워크와 Node.js 생태계를 기반으로 구축되어 있습니다.

---

### 1-1. NestJS (v10, TypeScript)
* **역할**: 백엔드 메인 서버 프레임워크
* **특징**:
  * Express 기반 위에 모듈화(Module), 컨트롤러(Controller), 서비스(Service) 구조를 강제하여 **대규모/팀 프로젝트 코드가 매우 깔끔하게 유지**됩니다.
  * TypeScript를 기본 지원하므로 컴파일 타임에 타입 에러를 잡을 수 있습니다.

---

### 1-2. PostgreSQL 15 & Prisma ORM (v5)
* **Database (PostgreSQL 15)**:
  * 오픈소스 관계형 데이터베이스(RDBMS)로, 유저 정보, 경기 전적, 칭호 데이터 등을 안전하고 엄격하게 보관합니다.
* **Prisma ORM**:
  * 복잡한 SQL 쿼리문 대신 TypeScript 객체 형태로 DB에 접근합니다.
  * 예: `prisma.user.findUnique({ where: { email } })`
  * `schema.prisma` 파일 하나로 DB 테이블 구조와 마이그레이션을 자동 관리합니다.

---

### 1-3. 인증 시스템 (JWT, Passport, bcryptjs)
* **bcryptjs**:
  * 회원가입 시 유저 비밀번호를 10단계 해시 연산하여 DB에 안전하게 암호화하여 저장합니다.
* **JWT (JSON Web Token)**:
  * 로그인 성공 시 유저 식별 정보가 담긴 서명된 토큰(Access Token)을 발급합니다.
  * 프론트엔드는 이후 모든 인증 요청 시 이 토큰을 헤더에 실어 보냅니다.
* **Passport**:
  * NestJS에서 JWT 토큰 검증 및 유저 인증 전략을 쉽게 처리하는 미들웨어입니다.

---

### 1-4. 실시간 통신 (WebSockets & Socket.IO)
* **역할**: 게임 대기방, 1v1 소켓 게임 대전, 1:1 DM 및 실시간 채널 채팅
* **특징**:
  * NestJS `@nestjs/websockets` 모듈로 Socket.IO 서버를 구축하여 단방향 HTTP 요청을 넘어 양방향 양방향 통신을 제공합니다.

---

### 1-5. 유효성 검사 (class-validator)
* **역할**: 클라이언트가 백엔드로 보내는 요청(DTO) 검증
* **특징**:
  * `@IsEmail()`, `@MinLength(6)`, `@Length(2, 10)`, `@Matches()` 등의 데코레이터로 잘못된 데이터 입력을 백엔드 입구에서 차단합니다.
