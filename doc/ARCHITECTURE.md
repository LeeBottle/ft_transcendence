# 🏗️ System Architecture & Infrastructure Specification

본 문서는 `ft_transcendence` 프로젝트의 전체 도커 네트워크 토폴로지, Nginx 리버스 프록시 및 디렉토리 구조 명세서입니다.

---

## 1. 컨테이너 토폴로지 (Docker Compose Architecture)

```text
                                [ Internet / Client ]
                                          │
                                          ▼
                                ┌───────────────────┐
                                │ Cloudflare Tunnel │
                                └─────────┬─────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │   Nginx Proxy     │
                                │    (Port 80/8080) │
                                └─────────┬─────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │ (HTTP Static)                               │ (API & WebSocket)
                   ▼                                             ▼
        ┌─────────────────────┐                       ┌─────────────────────┐
        │  Frontend Container │                       │  Backend Container  │
        │     (Vite/React)    │                       │    (NestJS App)     │
        └─────────────────────┘                       └──────────┬──────────┘
                                                                 │ (Database SQL)
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │ PostgreSQL Database │
                                                      │     (Port 5432)     │
                                                      └─────────────────────┘
```

---

## 2. Nginx 라우팅 명세

| 접속 경로 | 라우팅 대상 | 사용 프로토콜 | 설명 |
| :--- | :--- | :--- | :--- |
| `/` | `http://frontend:80` | HTTP / HTTPS | React SPA 프론트엔드 정적 파일 |
| `/api/` | `http://backend:3000/` | HTTP / HTTPS | NestJS REST API 엔드포인트 |
| `/socket.io/` | `http://backend:3000/socket.io/` | WebSockets (WS / WSS) | Socket.io 실시간 통신 및 핑 측정 |
| `/api/docs` | `http://backend:3000/api/docs` | HTTP | Swagger 인터랙티브 API 문서 |

---

## 3. 기술 스택 (Tech Stack Summary)

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, socket.io-client, i18next
* **Backend:** NestJS, TypeScript, Socket.io, Prisma ORM, Passport.js, Swagger, Throttler
* **Database:** PostgreSQL 15 (Alpine)
* **DevOps / Infra:** Docker, Docker Compose, Nginx (Alpine), Cloudflare Tunnel
