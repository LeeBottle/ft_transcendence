# 🛠️ 기술 스택 상세 설명: 3. 인프라 & 데브옵스 (DevOps)

`ft_transcendence` 인프라는 컨테이너 기반으로 독립적이고 동일한 개발/배포 환경을 보장합니다.

---

### 3-1. Docker & Docker Compose
* **Docker (독립 컨테이너)**:
  * 백엔드, 프론트엔드, 데이터베이스, Nginx를 각각의 독립된 컨테이너 환경에서 실행합니다.
  * 개발자 마다 OS나 환경이 달라 발생하는 "내 컴퓨터에서는 되는데?" 문제를 완벽히 해결합니다.
* **Docker Compose**:
  * `docker-compose.yml` 파일 하나로 여러 컨테이너(`postgres`, `backend`, `frontend`, `nginx`, `tunnel`)의 실행 순서, 환경변수, 네트워크, 볼륨(`pgdata`)을 통합 관리합니다.

---

### 3-2. Nginx (Reverse Proxy)
* **역할**: 단일 진입점(Gateway) 및 리버스 프록시
* **특징**:
  * 클라이언트의 요청을 받아 URL에 따라 적절한 서비스로 분기합니다:
    * `/api/*` 요청 ➔ 백엔드 서비스 (`backend:3000`)로 전달
    * `/socket.io/*` 요청 ➔ 백엔드 소켓 서비스로 전달
    * 나머지 요청 ➔ 프론트엔드 서비스 (`frontend:5173`)로 전달
  * 보안 향상 및 CORS 이슈 예방

---

### 3-3. Cloudflare Tunnel (`tunnel` 프로필)
* **역할**: 외부 인터넷 접속을 위한 안전한 암호화 터널링
* **특징**:
  * 복잡한 포트포워딩(Port Forwarding)이나 외부 IP 노출 없이 Cloudflare 가상 터널을 통해 어디서나 접근 가능한 보안 도메인/URL을 생성합니다.
  * `make tunnel` 명령어 하나로 간편하게 켜고 끌 수 있습니다.

---

### 3-4. Git & SSH 서명 검증 (Git Digital Signature)
* **역할**: 버전 관리 및 커밋 위변조 방지
* **특징**:
  * `git config --global gpg.format ssh` 설정을 통해 커밋 작성 시 본인의 SSH 암호화 키로 전자 서명을 남깁니다.
  * GitHub 상에서 타인의 위장 커밋이 아님을 검증받아 초록색 **`Verified` 뱃지**를 획득합니다.
