# 🗄️ Transcendence Database Schema Specification (PostgreSQL)

본 문서는 `ft_transcendence` 프로젝트의 PostgreSQL 데이터베이스 스키마 명세서입니다.

---

## 1. `USERS` (사용자 기본 정보 & 전적)

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID** | `SERIAL` | **PRIMARY KEY** | 사용자 고유 식별자 |
| **EMAIL** | `VARCHAR(255)` | **UNIQUE, NOT NULL** | 로그인 이메일 |
| **PASSWORD** | `VARCHAR(255)` | | 암호화된 비밀번호 (Bcrypt / OAuth 전용 계정 시 NULL 허용) |
| **NICKNAME** | `VARCHAR(50)` | **UNIQUE, NOT NULL** | 서비스 닉네임 |
| **AVATAR_URL** | `VARCHAR(255)` | | 프로필 이미지 경로 |
| **STATUS** | `VARCHAR(20)` | **DEFAULT 'OFFLINE'** | 접속 상태 (`ONLINE`, `OFFLINE`, `IN_GAME`) |
| **PLAY_COUNT** | `INTEGER` | **DEFAULT 0** | 총 게임 플레이 횟수 |
| **WIN** | `INTEGER` | **DEFAULT 0** | 승리 횟수 |
| **DRAW** | `INTEGER` | **DEFAULT 0** | 무승부 횟수 |
| **LOSE** | `INTEGER` | **DEFAULT 0** | 패배 횟수 |
| **CREATED_AT** | `TIMESTAMP` | **DEFAULT CURRENT_TIMESTAMP** | 회원가입 시각 |

---

## 2. `FRIENDS` (친구 및 차단 관계)

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID** | `SERIAL` | **PRIMARY KEY** | 관계 고유 ID |
| **USER_ID** | `INTEGER` | **FK (USERS.ID)** | 요청/주체 유저 ID |
| **FRIEND_ID** | `INTEGER` | **FK (USERS.ID)** | 대상 유저 ID |
| **STATUS** | `VARCHAR(20)` | **NOT NULL** | 관계 상태 (`PENDING`, `ACCEPTED`, `BLOCKED`) |
| **CREATED_AT** | `TIMESTAMP` | **DEFAULT CURRENT_TIMESTAMP** | 관계 생성 시각 |

> 📌 **UNIQUE Constraint:** `UNIQUE (USER_ID, FRIEND_ID)` (동일한 유저 쌍 중복 등록 방지)

---

## 3. `GAME_HISTORY` (경기 전적 기록)

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID** | `SERIAL` | **PRIMARY KEY** | 경기 기록 고유 ID |
| **GAME_TYPE** | `VARCHAR(50)` | **NOT NULL** | 게임 종류 (`TICTACTOE`, `YACHT`, `PONG`) |
| **PLAYER1_ID** | `INTEGER` | **FK (USERS.ID)** | 플레이어 1 ID |
| **PLAYER2_ID** | `INTEGER` | **FK (USERS.ID)** | 플레이어 2 ID |
| **PLAYER1_SCORE**| `INTEGER` | **NOT NULL** | 플레이어 1 최종 점수 |
| **PLAYER2_SCORE**| `INTEGER` | **NOT NULL** | 플레이어 2 최종 점수 |
| **WINNER_ID** | `INTEGER` | **FK (USERS.ID)** | 승리자 ID (무승부 시 NULL) |
| **PLAYED_AT** | `TIMESTAMP` | **DEFAULT CURRENT_TIMESTAMP** | 경기 진행 시각 |

---

## 4. `ACHIEVEMENT` (업적 정의)

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID** | `SERIAL` | **PRIMARY KEY** | 업적 고유 ID |
| **CODE** | `VARCHAR(50)` | **UNIQUE, NOT NULL** | 업적 식별 코드 (예: `FIRST_WIN`) |
| **NAME** | `VARCHAR(100)` | **NOT NULL** | 화면 표시 업적 이름 |
| **DESCRIPTION** | `TEXT` | **NOT NULL** | 업적 달성 조건 설명 |
| **ICON_URL** | `VARCHAR(255)` | | 업적 아이콘 경로 |

---

## 5. `USER_ACHIEVEMENT` (유저 업적 해금 내역)

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID** | `SERIAL` | **PRIMARY KEY** | 획득 내역 고유 ID |
| **USER_ID** | `INTEGER` | **FK (USERS.ID)** | 획득 유저 ID |
| **ACHIEVEMENT_ID**| `INTEGER` | **FK (ACHIEVEMENT.ID)** | 획득 업적 ID |
| **UNLOCKED_AT** | `TIMESTAMP` | **DEFAULT CURRENT_TIMESTAMP** | 달성 시각 |

> 📌 **UNIQUE Constraint:** `UNIQUE (USER_ID, ACHIEVEMENT_ID)` (동일 업적 중복 달성 방지)

---

## 6. `CHAT_MESSAGE` (실시간 채팅 메시지 기록)

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **ID** | `SERIAL` | **PRIMARY KEY** | 메시지 고유 ID |
| **SENDER_ID** | `INTEGER` | **FK (USERS.ID)** | 발신 유저 ID |
| **ROOM_ID** | `VARCHAR(100)` | **NOT NULL** | 소켓 방 ID (DM 방 or 전체 채널) |
| **MESSAGE** | `TEXT` | **NOT NULL** | 메시지 본문 |
| **SENT_AT** | `TIMESTAMP` | **DEFAULT CURRENT_TIMESTAMP** | 전송 시각 |
