# 📜 ft_transcendence 모듈 선택서 (Module Selection)

- **목표 점수**: 14점 이상 (필수 충족)
- **선택 모듈 총점**: **28점** / 14점 (보너스 5점 만점 완벽 확보! 🎯)

---

## 1. 확정 모듈 명세 목록 (Selected Modules Table)

| # | 카테고리 | 모듈명 | 구분 | 점수 | 구현 내용 / 비고 |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Web** | 프론트엔드 + 백엔드 프레임워크 | Major | 2점 | React (Vite) + NestJS |
| 2 | **Web** | WebSockets 실시간 기능 | Major | 2점 | Socket.io 실시간 턴/체팅/핑 통신 |
| 3 | **Web** | 사용자 상호작용 (User Interaction) | Major | 2점 | 1:1 DM, 전체 채널, 친구 관리, 프로필 |
| 4 | **Web** | 공개 API (Public API) | Major | 2점 | API Key + Rate Limit + Swagger + 5개 엔드포인트 |
| 5 | **Web** | ORM 사용 | Minor | 1점 | Prisma ORM (PostgreSQL) |
| 6 | **Web** | 프로그레시브 웹 앱 (PWA) | Minor | 1점 | 오프라인 캐싱 (`sw.js`) + Manifest 앱 설치 지원 |
| 7 | **Accessibility** | 다국어 지원 (i18n - 3개 언어) | Minor | 1점 | 한국어, 영어, 일본어 (i18next) |
| 8 | **Accessibility** | RTL (Right-to-Left) 언어 지원 | Minor | 1점 | 아랍어 레이아웃 미러링 지원 |
| 9 | **Accessibility** | 추가 브라우저 지원 | Minor | 1점 | Chrome, Firefox, Edge 완벽 호환 |
| 10 | **User Mgmt** | 표준 사용자 관리 및 인증 | Major | 2점 | 회원가입, 로그인, 프로필 수정, 아바타 업로드 |
| 11 | **User Mgmt** | 게임 통계 및 매치 기록 | Minor | 1점 | 승/패/무 전적, 매치 히스토리 리더보드 |
| 12 | **AI** | AI 대국자 (AI Opponent) | Major | 2점 | 틱택토 Minimax 알고리즘 (인간적 미스 확률 15%) |
| 13 | **Gaming** | 메인 웹 기반 게임 | Major | 2점 | **야추 (Yacht Dice)** 5개 주사위 게임 |
| 14 | **Gaming** | 원격 플레이어 (1v1 Remote) | Major | 2점 | WebSocket 1v1 원격 실시간 대전 |
| 15 | **Gaming** | 멀티플레이어 게임 (3인 이상) | Major | 2점 | 야추 3~4인 실시간 순번 대전 방 |
| 16 | **Gaming** | 두 번째 게임 추가 | Major | 2점 | **틱택토 (Tic-Tac-Toe)** |
| 17 | **Gaming** | 게임 커스텀 옵션 | Minor | 1점 | 보드판 테마 및 주사위 색상 커스터마이징 |
| 18 | **Gaming** | 게이미피케이션 (Gamification) | Minor | 1점 | 업적 배지 3종, 랭킹 리더보드 |

---

## 2. 문서화 구조 요약

* `DATABASE_SCHEMA.md`: PostgreSQL 스키마 및 테이블 명세
* `API_SPECIFICATION.md`: REST API & 공개 API (Swagger/RateLimit) 명세
* `WEBSOCKET_SPECIFICATION.md`: Socket.io 실시간 소켓 규격
* `GAME_LOGIC_SPECIFICATION.md`: 야추 12족보 & 틱택토 AI 로직
* `ARCHITECTURE.md`: 시스템 도커 & 아키텍처 명세
* `TESTING_AND_CHECKLIST.md`: 동료 평가용 시연 시나리오 및 체크리스트
