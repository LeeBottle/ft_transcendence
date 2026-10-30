# ✅ Peer Evaluation Checklist & Demonstration Scenario

본 문서는 동료 평가(Peer Review) 시 선택한 18개 모듈(총 28점)을 시연하고 평가를 통과하기 위한 시나리오 가이드입니다.

---

## 1. 평가자 시연 시나리오 (Step-by-Step Scenario)

### STEP 1: 단일 명령 실행 (Mandatory Part)
* 터미널에서 `make` 명령 한 줄로 컨테이너 빌드 및 도커 실행 시연

### STEP 2: 서비스 접속 & 다국어/RTL/PWA 확인
* 발급된 HTTPS 주소 접속
* 상단 언어 스위처 클릭 ➔ **한국어 / 영어 / 일본어** 텍스트 변경 확인
* **아랍어 (RTL)** 선택 시 레이아웃 우측 정렬 미러링 확인
* 크롬 주소창 옆 **'앱 설치' 버튼 (PWA)** 시연 및 F12 Lighthouse PWA 검사 점수 확인

### STEP 3: 공개 API & Swagger 문서 시연
* `https://.../api/docs` 접속 ➔ Swagger 인터랙티브 UI 확인
* `x-api-key` 입력 후 **`GET /api/users/me`**, **`GET /api/game/history`** 등 5개 엔드포인트 **Try it out** 실행 시연
* 1분간 60회 초과 호출 시 **`429 Rate Limit`** 발동 시연

### STEP 4: 사용자 관리 & 실시간 소켓 대시보드
* 회원가입 및 로그인 ➔ 프로필 닉네임/아바타 변경
* 핑(RTT) 대시보드에서 **실시간 ms 핑 수치 및 최근 20회 바 그래프** 시연
* 두 개 탭을 열어 **실시간 오픈 채팅 & 1:1 DM** 송수신 시연

### STEP 5: 서브 게임 (틱택토 1v1 & AI 대국)
* **AI 대국 선택:** Minimax AI와 틱택토 진행 (AI 착수 시연)
* **1v1 원격 대전:** 두 브라우저 창에서 실시간 턴 주고받기 및 승패 판정 시연

### STEP 6: 메인 게임 (야추 3~4인 멀티플레이어 & 1v1)
* 주사위 5개 굴리기 및 **Keep(고정) 선택 후 3회 리롤** 시연
* **12가지 족보 (Yacht, Full House, Straights 등)** 선택 및 보너스 점수(+35) 자동 계산 시연
* 게임 완료 후 **업적(Achievement) 해금 팝업** 및 **전적 리더보드** 시연
