# 🔌 WebSocket (Socket.io) 이벤트 명세서

본 문서는 `ft_transcendence` 프로젝트의 실시간 소켓 이벤트 규격 명세서입니다.

---

## 1. 핑 / 커넥션 이벤트

| 이벤트명 | 방향 | 데이터 Payload | 설명 |
| :--- | :--- | :--- | :--- |
| `ping` | Client ➔ Server | `{ clientTime: number }` | 지연시간(RTT) 측정 요청 |
| `pong` | Server ➔ Client | `{ clientTime: number, serverTime: number }` | 지연시간 응답 |
| `user:status` | Server ➔ Client | `{ userId: number, status: 'ONLINE' \| 'OFFLINE' \| 'IN_GAME' }` | 접속 상태 변경 알림 |

---

## 2. 오픈 채팅 & DM 이벤트 (`/socket.io`)

| 이벤트명 | 방향 | 데이터 Payload | 설명 |
| :--- | :--- | :--- | :--- |
| `chatMessage` | Client ➔ Server | `{ text: string }` | 전체 오픈 채널 메시지 전송 |
| `chatMessage` | Server ➔ Client | `{ user: string, text: string, time: string }` | 브로드캐스트 메시지 수신 |
| `dm:send` | Client ➔ Server | `{ targetUserId: number, text: string }` | 1:1 귓속말 전송 |
| `dm:receive` | Server ➔ Client | `{ fromUserId: number, text: string, time: string }` | 1:1 귓속말 수신 |

---

## 3. 틱택토 (Tic-Tac-Toe) 게임 이벤트

| 이벤트명 | 방향 | 데이터 Payload | 설명 |
| :--- | :--- | :--- | :--- |
| `tictactoe:join` | Client ➔ Server | `{ mode: 'AI' \| 'REMOTE', roomId?: string }` | 매칭 대기열 진입 또는 방 참가 |
| `tictactoe:start` | Server ➔ Client | `{ roomId: string, playerX: number, playerO: number, turn: 'X' }` | 게임 시작 알림 |
| `tictactoe:move` | Client ➔ Server | `{ roomId: string, index: number }` | 0~8 칸 착수 요청 |
| `tictactoe:state` | Server ➔ Client | `{ board: Array<string \| null>, turn: 'X' \| 'O', winner: string \| null }` | 보드판 상태 업데이트 |
| `tictactoe:end` | Server ➔ Client | `{ winnerId: number \| null, reason: 'WIN' \| 'DRAW' \| 'SURRENDER' }` | 게임 종료 |

---

## 4. 야추 (Yacht Dice) 게임 이벤트

| 이벤트명 | 방향 | 데이터 Payload | 설명 |
| :--- | :--- | :--- | :--- |
| `yacht:join` | Client ➔ Server | `{ roomId?: string }` | 방 참가 및 1v1 대전 대기 |
| `yacht:roll` | Client ➔ Server | `{ roomId: string, keepDiceIndices: number[] }` | 주사위 굴리기 (고정할 주사위 지정) |
| `yacht:rollResult` | Server ➔ Client | `{ dice: number[], rollCountLeft: number }` | 굴림 결과 및 남은 횟수 |
| `yacht:score` | Client ➔ Server | `{ roomId: string, category: string }` | 점수판 항목에 기록 확정 |
| `yacht:turnChange` | Server ➔ Client | `{ nextTurnUserId: number, scoreboard: object }` | 턴 교체 및 점수판 업데이트 |
| `yacht:end` | Server ➔ Client | `{ winnerId: number, player1Total: number, player2Total: number }` | 최종 점수 및 승리자 |
