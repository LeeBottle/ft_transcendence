# GitHub Discussions / Wiki 카테고리 자동 리다이렉트 해결 가이드

GitHub Discussions(디스커션) 또는 Wiki에서 카테고리를 누를 때 첫 번째 글/문서로 자동 이동되는 현상의 대표 원인과 해결법입니다.

---

### 원인 1. 카테고리 형태가 `Announcements` (공지사항)으로 설정된 경우 ⭐ (가장 흔함)

GitHub Discussions에서 카테고리 타입을 **`Announcements`** 형태로 만들면, 일반 게시판 목록 대신 **가장 최신/첫 번째 게시글을 본문 형태로 바로 띄우는 프리뷰 방식**으로 동작합니다.

#### 🔧 고치는 방법 (카테고리 수정):
1. **GitHub Discussions** 탭으로 이동합니다.
2. 왼쪽 카테고리 목록에서 문제가 되는 카테고리 옆의 **⚙️ (설정) 아이콘** 또는 **Edit Category** 클릭
3. **Category Format** (게시글 형태)을 `Announcements` ➔ **`Open-ended discussion` (또는 `Q&A`)**로 변경합니다.
4. **Save**를 누르면 카테고리를 눌렀을 때 특정 글이 아닌 **전체 글 목록(게시판 형태)**이 정상적으로 뜹니다.

---

### 원인 2. 핀(Pinned) 고정글이 1개만 있는 경우
카테고리에 📌 **Pinned Discussion**이 등록되어 있으면 상단 뷰어가 해당 글을 자동 선택할 수 있습니다.

#### 🔧 해결법:
* 해당 디스커션 글 우측 메뉴에서 **`Unpin discussion`**을 눌러 고정을 해제합니다.

---

### 원인 3. GitHub Wiki인 경우
Wiki 기능을 사용할 때 카테고리/폴더를 누르면 GitHub 특성상 폴더 내 첫 번째 `.md` 문서를 자동으로 보여줍니다.
* **해결법**: 각 카테고리(폴더) 첫 장에 `index.md` 또는 `README.md` 역할을 하는 목차 문서를 만들어두면 깔끔하게 해결됩니다.
