# 🎯 GitHub Issue 관리 모범 실전 가이드

> **이 가이드의 목표:** ft_transcendence 과제 진행 시 팀원 간 작업 중복을 막고, README 제출 시 "프로젝트 관리를 완벽히 수행했다"는 평가를 받기 위한 이슈 관리 표준입니다.

---

## 1. 이슈(Issue) 생명주기 (Life Cycle)

모든 개발 작업은 **[이슈 생성 ➡️ 작업 진행 ➡️ 코드 리뷰(PR) ➡️ 이슈 닫기(Close)]** 4단계를 거칩니다.

```text
[1. Issue 생성]  ──>  [2. In Progress]  ──>  [3. PR 작성]  ──>  [4. Issue Close]
(할 일 등록)            (팀원 할당 & 개발)      (Fixes #이슈번호)       (자동 Done 처리)
```

---

## 2. 이슈 작성 템플릿 (작성 표준)

이슈를 만들 때 제목과 내용을 아래 규칙대로 적어두면 팀원들이 명확히 이해할 수 있습니다.

### 📌 제목 규칙 (Title Format)
`[태그] 세부 작업 내용`

* **예시:**
  * `[Auth] 42 OAuth 로그인 백엔드 연동`
  * `[Game] 틱택토 3x3 보드 React UI 구현`
  * `[DevOps] Docker Compose 및 Nginx HTTPS 세팅`
  * `[Bug] 소켓 재연결 시 세션 끊김 버그 수정`

### 📝 본문 내용 템플릿 (Body Template)

```markdown
## 🎯 작업 목적 (Overview)
- 42 OAuth API를 통해 유저 인증을 처리하고 JWT 토큰을 발급합니다.

## ✅ 체크리스트 (To-Do)
- [ ] 42 API App 등록 및 Client ID/Secret 환경변수 세팅
- [ ] Backend Passport Strategy 작성
- [ ] Frontend 로그인 버튼과 OAuth 리다이렉트 연결

## 🔗 연관 모듈 (Related Module)
- User Management (OAuth 2.0 - Minor 1pt)
```

---

## 3. 이슈 우측 사이드바 설정 (필수 4가지)

이슈를 생성할 때 오른쪽 메뉴에서 아래 4가지를 지정해 주세요.

1. **Assignees (담당자)**: 이 일을 담당할 팀원 선택 (예: `sanghul2`)
2. **Labels (라벨)**: 작업 종류 태그 부착
   * `frontend`, `backend`, `game`, `auth`, `bug`, `documentation` 등
3. **Projects (프로젝트)**: 만들어둔 프로젝트 보드 선택 ➡️ 선택 즉시 프로젝트 보드의 `Todo` 칸에 카드가 등록됨!
4. **Milestone (마일스톤)**: `1차 메인 오목/틱택토 완성`, `2차 소셜/야추 완성` 등 목표 기간으로 묶어두기

---

## 4. 🔥 개발자 필수 치트키: 이슈 자동 닫기 (Auto-Close)

개발 완료 후 코드를 올릴 때 **커밋 메시지(Commit Message)** 또는 **PR(Pull Request) 설명**에 키워드와 이슈 번호를 적으면, 코드 수락 시 **이슈가 자동으로 닫히고 프로젝트 보드에서 `Done`으로 이동**합니다.

### 💡 키워드 예시:
* `Fixes #1` (1번 이슈 해결 및 닫기)
* `Closes #4` (4번 이슈 완료 및 닫기)
* `Resolves #12` (12번 이슈 해결 및 닫기)

#### 예시 커밋 메시지:
```bash
git commit -m "feat: 42 OAuth 로그인 연동 완료 (Fixes #3)"
```

---

## 5. 실전 관리 꿀팁 3가지

1. **하나의 이슈에는 하나의 작업만**:  
   "로그인 만들고 게임도 만들기"처럼 거대하게 만들지 말고, "로그인 만들기" 1개, "게임 UI 만들기" 1개로 작게 쪼개세요.
2. **이슈 댓글(Comments) 활용**:  
   개발하다가 막히는 부분이나 참고 자료 링크는 해당 이슈 댓글창에 남겨두세요.
3. **하루 시작할 때 이슈 픽하기**:  
   팀 회의 때 오늘 할 이슈를 `Todo`에서 `In Progress`로 옮기고 자기 이름을 `Assignee`로 지정한 후 개발을 시작하세요.
