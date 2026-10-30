# 📡 REST API 및 공개 API(Public API) 명세서

본 문서는 `ft_transcendence` 프로젝트의 백엔드 REST API 및 공개 API(Major 2점 모듈) 명세서입니다.

---

## 🔒 공개 API 공통 보안 & 정책 사양 (Public API Policy)

1. **보안 API 키 (API Key Authentication):**
   * 공개 API 호출 시 요청 헤더에 `x-api-key: {YOUR_API_KEY}`를 포함해야 합니다.
2. **속도 제한 (Rate Limiting):**
   * `@nestjs/throttler` 기반: IP/API 키당 **1분간 최대 60회 요청 가능** (초과 시 `429 Too Many Requests`)
3. **인터랙티브 API 문서화 (Swagger Documentation):**
   * 접속 경로: `https://localhost/api/docs` (Swagger UI를 통해 API 테스트 및 명세 실시간 제공)

---

## 1. 인증 API (`/api/auth`)

### 1.1 회원가입
* **Endpoint:** `POST /api/auth/signup`
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "nickname": "cadet"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "cadet",
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 1.2 일반 로그인
* **Endpoint:** `POST /api/auth/login`
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "cadet"
    }
  }
  ```

### 1.3 42 OAuth 로그인 콜백
* **Endpoint:** `GET /api/auth/42/callback?code={authorization_code}`
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 2,
      "email": "cadet@student.42seoul.kr",
      "nickname": "sanghul2"
    }
  }
  ```

---

## 2. 사용자 관리 API (`/api/users`)

### 2.1 내 프로필 조회
* **Endpoint:** `GET /api/users/me`
* **Headers:** `Authorization: Bearer {token}`
* **Response (200 OK):**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "cadet",
    "avatarUrl": "/avatars/default.png",
    "status": "ONLINE",
    "stats": {
      "playCount": 10,
      "win": 7,
      "draw": 1,
      "lose": 2,
      "winRate": "70%"
    }
  }
  ```

### 2.2 프로필 수정 (닉네임/아바타)
* **Endpoint:** `PATCH /api/users/me`
* **Headers:** `Authorization: Bearer {token}`
* **Request Body:**
  ```json
  {
    "nickname": "new_nickname",
    "avatarUrl": "/avatars/new.png"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "id": 1,
    "nickname": "new_nickname",
    "avatarUrl": "/avatars/new.png"
  }
  ```

### 2.3 타인 프로필 조회
* **Endpoint:** `GET /api/users/:id`
* **Response (200 OK):**
  ```json
  {
    "id": 2,
    "nickname": "sanghul2",
    "avatarUrl": "/avatars/default.png",
    "status": "IN_GAME",
    "stats": {
      "playCount": 5,
      "win": 3,
      "draw": 0,
      "lose": 2
    }
  }
  ```

---

## 3. 친구 관리 API (`/api/friends`)

### 3.1 친구 목록 조회
* **Endpoint:** `GET /api/friends`
* **Headers:** `Authorization: Bearer {token}`
* **Response (200 OK):**
  ```json
  [
    {
      "id": 2,
      "nickname": "sanghul2",
      "status": "ONLINE",
      "avatarUrl": "/avatars/default.png"
    }
  ]
  ```

### 3.2 친구 신청
* **Endpoint:** `POST /api/friends/request`
* **Request Body:** `{"friendId": 2}`
* **Response (200 OK):** `{"message": "Friend request sent"}`

### 3.3 친구 수락 / 거절 / 차단
* **Endpoint:** `PATCH /api/friends/:id`
* **Request Body:** `{"status": "ACCEPTED"}` // ACCEPTED, BLOCKED
* **Response (200 OK):** `{"message": "Friend status updated"}`

---

## 4. 전적 & 업적 API (`/api/game`, `/api/achievements`)

### 4.1 게임 전적 기록 조회
* **Endpoint:** `GET /api/game/history`
* **Response (200 OK):**
  ```json
  [
    {
      "id": 101,
      "gameType": "TICTACTOE",
      "player1": { "id": 1, "nickname": "cadet" },
      "player2": { "id": 2, "nickname": "sanghul2" },
      "winnerId": 1,
      "playedAt": "2026-08-12T12:00:00Z"
    }
  ]
  ```

### 4.2 업적 목록 & 획득 상태 조회
* **Endpoint:** `GET /api/achievements`
* **Response (200 OK):**
  ```json
  [
    {
      "code": "FIRST_WIN",
      "name": "첫 승리의 기쁨",
      "description": "첫 판을 승리하세요",
      "unlocked": true,
      "unlockedAt": "2026-08-12T12:00:00Z"
    }
  ]
  ```
