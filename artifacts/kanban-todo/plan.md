# Kanban Todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 | @dnd-kit | React 전용, 경량(~15KB), 접근성 내장, 칸반 예제 공식 제공 |
| 상태 관리 | React Context + useReducer | 외부 의존성 없음, 복잡한 상태 전환을 reducer로 명시적 관리, localStorage 연동 커스텀 훅 |
| 데이터 저장 | localStorage | spec 요구사항. 버전 스키마 적용 |
| 다크모드 | CSS 변수 + class 토글 | Next.js + Tailwind dark: 접두사 활용. system prefers-color-scheme 감지 |
| 아이콘 | @phosphor-icons/react | components.json iconLibrary 설정. wireframe은 lucide(미리보기용)이나 구현은 phosphor |
| 컴포넌트 스타일 | shadcn/ui (radix-mira) | 프로젝트 기존 설정 |

## Required Skills

| 스킬 | 용도 |
|------|------|
| `vercel-react-best-practices` | React/Next.js 성능 최적화 규칙 (62개 규칙) |
| `web-design-guidelines` | Web Interface Guidelines 준수 |
| `shadcn` | shadcn/ui 컴포넌트 사용 규칙, 스타일링, composition |

## UI Components

### 기존 사용 (설치됨)

| 컴포넌트 | 용도 |
|----------|------|
| Card | 카드 컨테이너 |
| Badge | 우선순위/태그 뱃지 |
| Button | 액션 버튼 |
| Input, Textarea | 텍스트 입력 |
| Select | 우선순위/태그 필터, 우선순위 편집 |
| Dialog | 카드 생성 모달 |
| AlertDialog | 칼럼/카드 삭제 확인 |
| Checkbox | 서브태스크 체크리스트 |
| Switch | 다크모드 토글 |
| Label, Field | 폼 필드 레이블 |
| DropdownMenu | 칼럼 액션 메뉴 |
| Separator | 구분선 |

### 설치 필요

| 컴포넌트 | 설치 명령 |
|----------|-----------|
| Progress | `bunx shadcn@latest add progress` |
| Popover | `bunx shadcn@latest add popover` |
| ScrollArea | `bunx shadcn@latest add scroll-area` |

### 외부 패키지

| 패키지 | 설치 명령 | 용도 |
|--------|-----------|------|
| @dnd-kit/core | `bun add @dnd-kit/core` | 드래그&드롭 코어 |
| @dnd-kit/sortable | `bun add @dnd-kit/sortable` | 정렬 가능 목록 |
| @dnd-kit/utilities | `bun add @dnd-kit/utilities` | CSS 유틸리티 |

### 커스텀 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| KanbanBoard | 보드 레이아웃, DndContext 래퍼, 칼럼 배치 |
| KanbanColumn | 칼럼 컨테이너, SortableContext, 칼럼 헤더/액션 |
| KanbanCard | 드래그 가능 카드, 필드 표시, 인라인 편집 트리거 |
| CardDetailPanel | 카드 상세 뷰 (인라인 편집 + 서브태스크 + 태그) |
| CardCreateDialog | 카드 생성 모달 폼 |
| TagManager | 태그 CRUD + 색상 선택 |
| SubtaskList | 서브태스크 체크리스트 + 진행률 |
| BoardFilters | 검색 + 우선순위/태그 필터 바 |
| ThemeToggle | 다크모드 토글 (Switch + system 감지) |

## 실행 프로토콜

- 각 task 시작 전, **참조 규칙**에 나열된 파일을 반드시 읽고 규칙을 준수하며 구현한다

## Tasks

### Task 0: 프로젝트 셋업 — 패키지 설치 및 shadcn 컴포넌트 추가

- **시나리오**: (선행 작업)
- **참조 규칙**: `.claude/skills/shadcn/rules/base-vs-radix.md`
- **구현 대상**:
  - @dnd-kit 패키지 3종 설치
  - shadcn progress, popover, scroll-area 컴포넌트 추가
- **수용 기준**:
  - [ ] `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` 성공
  - [ ] `bunx shadcn@latest add progress popover scroll-area` 성공
  - [ ] `bun run test` 기존 테스트 통과 유지
- **커밋**: `chore: add dnd-kit and shadcn components for kanban`

---

### Task 1: 데이터 모델 및 타입 정의

- **시나리오**: 전체 시나리오의 기반
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/client-localstorage-schema.md`
- **구현 대상**:
  - `lib/kanban/types.ts` — Board, Column, Card, Tag, Subtask 타입 정의
  - `lib/kanban/constants.ts` — 기본 칼럼, 우선순위 목록, localStorage 키/버전
- **수용 기준**:
  - [ ] Column 타입: id, name, cardIds 포함
  - [ ] Card 타입: id, title, description, priority, tagIds, dueDate, assignee, subtasks, coverImageUrl, createdAt, modifiedAt 포함
  - [ ] Tag 타입: id, name, color 포함
  - [ ] Subtask 타입: id, title, completed 포함
  - [ ] Priority enum: "High" | "Medium" | "Low"
  - [ ] localStorage 스키마 버전 상수 정의
- **커밋**: `feat: define kanban data model and types`

---

### Task 2: 상태 관리 — Context, Reducer, localStorage 연동

- **시나리오**: KANBAN-038, 039, 040 (데이터 영속성)
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md`
  - `.claude/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md`
  - `.claude/skills/vercel-react-best-practices/rules/client-localstorage-schema.md`
  - `.claude/skills/vercel-react-best-practices/rules/js-cache-storage.md`
- **구현 대상**:
  - `lib/kanban/reducer.ts` — boardReducer (칼럼/카드/태그 CRUD 액션)
  - `lib/kanban/context.tsx` — KanbanProvider, useKanban 훅
  - `lib/kanban/storage.ts` — localStorage 읽기/쓰기, 스키마 버전 마이그레이션
- **수용 기준**:
  - [ ] KanbanProvider가 초기 상태를 localStorage에서 lazy 로드
  - [ ] 상태 변경 시 localStorage에 자동 동기화
  - [ ] localStorage가 비어있으면 기본 칼럼 3개(Todo, In Progress, Done) 생성
  - [ ] 페이지 새로고침 후 데이터 유지 (KANBAN-038, 039, 040)
- **커밋**: `feat: implement kanban state management with localStorage sync`

---

### Task 3: spec 테스트 생성 — 전체 시나리오

- **시나리오**: KANBAN-001 ~ KANBAN-045
- **참조 규칙**:
  - `artifacts/spec.yaml`
  - `CLAUDE.md` (spec 테스트 작성 규칙)
- **구현 대상**:
  - `__tests__/kanban-board.spec.test.tsx` — 칼럼 관리 (KANBAN-001~005, 044)
  - `__tests__/kanban-card.spec.test.tsx` — 카드 CRUD (KANBAN-006~016, 041~043)
  - `__tests__/kanban-subtask.spec.test.tsx` — 서브태스크 (KANBAN-017~020)
  - `__tests__/kanban-dnd.spec.test.tsx` — 드래그&드롭 (KANBAN-021~023)
  - `__tests__/kanban-tag.spec.test.tsx` — 태그 관리 (KANBAN-024~027)
  - `__tests__/kanban-search-filter.spec.test.tsx` — 검색·필터 (KANBAN-028~034, 045)
  - `__tests__/kanban-theme.spec.test.tsx` — 다크모드 (KANBAN-035~037)
- **수용 기준**:
  - [ ] 모든 45개 시나리오가 spec 테스트로 커버됨
  - [ ] getByRole, getByLabelText 등 구현 비종속 셀렉터 사용
  - [ ] 모든 테스트가 Red 상태 (구현 전이므로 실패)
- **커밋**: `test: add spec tests for all 45 kanban scenarios`

---

### Task 4: 칸반 보드 레이아웃 — KanbanBoard + KanbanColumn

- **시나리오**: KANBAN-001, 002, 003, 004, 005, 044
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md`
  - `.claude/skills/vercel-react-best-practices/rules/rendering-conditional-render.md`
  - `.claude/skills/shadcn/rules/composition.md`
  - `.claude/skills/shadcn/rules/styling.md`
  - `web-design-guidelines` (WebFetch로 최신 가이드라인 참조)
- **구현 대상**:
  - `components/kanban/kanban-board.tsx` — 보드 레이아웃, ScrollArea 가로 스크롤
  - `components/kanban/kanban-column.tsx` — 칼럼 컨테이너, 헤더(이름+카드수+액션), 칼럼 추가 버튼
  - `components/kanban/column-header.tsx` — 칼럼 이름 편집, 삭제 (AlertDialog 확인)
  - `app/page.tsx` — KanbanProvider + KanbanBoard 렌더링
- **수용 기준**:
  - [ ] 초기 접속 시 "Todo", "In Progress", "Done" 3칼럼 표시 (KANBAN-001)
  - [ ] "칼럼 추가" → "QA" 입력 → 4번째 칼럼 표시 (KANBAN-002)
  - [ ] 칼럼 이름 클릭 → 인라인 편집 → "진행 중" 변경 (KANBAN-003)
  - [ ] 빈 칼럼 삭제 시 즉시 제거 (KANBAN-004)
  - [ ] 카드 있는 칼럼 삭제 시 AlertDialog 확인 (KANBAN-005, 044)
  - [ ] 반응형: Desktop=가로 배치, Mobile=세로 스택
- **커밋**: `feat: implement kanban board and column layout`

---

### Task 5: 카드 표시 + 생성 — KanbanCard + CardCreateDialog

- **시나리오**: KANBAN-006~011
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-memo.md`
  - `.claude/skills/vercel-react-best-practices/rules/rendering-conditional-render.md`
  - `.claude/skills/shadcn/rules/forms.md`
  - `.claude/skills/shadcn/rules/icons.md`
  - `.claude/skills/shadcn/rules/composition.md`
- **구현 대상**:
  - `components/kanban/kanban-card.tsx` — 카드 표시 (커버이미지, 우선순위 뱃지, 제목, 설명, 태그, 마감일, 담당자, 서브태스크 진행률, 생성일, 삭제 버튼)
  - `components/kanban/card-create-dialog.tsx` — Dialog 모달 폼 (제목*, 설명, 우선순위 Select, 마감일, 담당자, 태그, 커버 이미지 URL)
- **수용 기준**:
  - [ ] "Todo" 칼럼 "추가" → 제목 "API 설계", 설명 "REST 엔드포인트 정의" → 카드 표시 (KANBAN-006)
  - [ ] 빈 제목 생성 시도 → "제목을 입력해주세요" 오류 (KANBAN-007)
  - [ ] 우선순위 "High" → High 뱃지 표시 (KANBAN-008)
  - [ ] 마감일 "2026-04-01" → 카드에 마감일 표시 (KANBAN-009)
  - [ ] 담당자 "김개발" → 카드에 표시 (KANBAN-010)
  - [ ] 커버 이미지 URL → 카드 상단 이미지 표시 (KANBAN-011)
- **커밋**: `feat: implement kanban card display and creation`

---

### Task 6: 카드 인라인 편집 + 삭제 — CardDetailPanel

- **시나리오**: KANBAN-012~016, 041~043
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md`
  - `.claude/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md`
  - `.claude/skills/shadcn/rules/forms.md`
- **구현 대상**:
  - `components/kanban/card-detail-panel.tsx` — 카드 상세 뷰, 인라인 편집 (제목 Input, 설명 Textarea, 우선순위 Select, 담당자 Input, 마감일 Input)
  - 카드 삭제 AlertDialog 연동
  - 생성일/수정일 자동 표시
- **수용 기준**:
  - [ ] 제목 클릭 → 입력란 → "API 문서화"로 수정 (KANBAN-012)
  - [ ] 설명 클릭 → 텍스트 영역 → "GraphQL 스키마 정의"로 수정 (KANBAN-043)
  - [ ] 우선순위 High→Low 변경 → 뱃지 변경 (KANBAN-013)
  - [ ] Escape 키 → 편집 취소, 원래 값 유지 (KANBAN-014)
  - [ ] 삭제 버튼 → 확인 → 카드 제거 (KANBAN-015)
  - [ ] 삭제 취소 → 카드 유지 (KANBAN-016)
  - [ ] 생성일 표시 (KANBAN-041), 수정일 갱신 (KANBAN-042)
- **커밋**: `feat: implement card inline editing and deletion`

---

### Task 7: 서브태스크 — SubtaskList

- **시나리오**: KANBAN-017~020
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md`
  - `.claude/skills/shadcn/rules/composition.md`
- **구현 대상**:
  - `components/kanban/subtask-list.tsx` — 체크리스트 (Checkbox + Progress), 추가/삭제
- **수용 기준**:
  - [ ] 서브태스크 "DB 스키마 작성" 추가 → 체크리스트에 표시 (KANBAN-017)
  - [ ] 3개 중 2개 체크 → 진행률 "2/3" (KANBAN-018)
  - [ ] 서브태스크 삭제 → 체크리스트에서 제거 (KANBAN-019)
  - [ ] 모든 서브태스크 완료 → "3/3" (KANBAN-020)
- **커밋**: `feat: implement subtask checklist with progress`

---

### Task 8: 태그 관리 — TagManager

- **시나리오**: KANBAN-024~027
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/composition.md`
  - `.claude/skills/shadcn/rules/styling.md`
- **구현 대상**:
  - `components/kanban/tag-manager.tsx` — 태그 생성(이름+색상 Popover), 카드에 태그 추가/제거
- **수용 기준**:
  - [ ] "Backend" 태그 + 파란색 생성 → 태그 목록에 표시 (KANBAN-024)
  - [ ] 카드에 "Backend" 태그 추가 → 뱃지 표시 (KANBAN-025)
  - [ ] 태그 제거 → 뱃지 사라짐 (KANBAN-026)
  - [ ] 복수 태그 "Backend", "Urgent" 추가 → 모두 표시 (KANBAN-027)
- **커밋**: `feat: implement tag management with color picker`

---

### Task 9: 드래그 & 드롭 — @dnd-kit 통합

- **시나리오**: KANBAN-021~023
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-memo.md`
  - `.claude/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md`
- **구현 대상**:
  - `components/kanban/kanban-board.tsx` 업데이트 — DndContext, DragOverlay (태그 포함 카드 미리보기)
  - `components/kanban/kanban-card.tsx` 업데이트 — useSortable 적용
  - 칼럼 간 이동 + 칼럼 내 순서 변경 핸들러
- **수용 기준**:
  - [ ] "Todo" 카드를 "In Progress"로 드래그 → 칼럼 간 이동 (KANBAN-021)
  - [ ] "Todo" 칼럼 내 "C" 카드를 "A" 위로 드래그 → "C", "A", "B" 순서로 표시 (KANBAN-022)
  - [ ] 새로고침 후 위치 유지 (KANBAN-023)
- **커밋**: `feat: implement drag and drop with dnd-kit`

---

### Task 10: 검색 · 필터 — BoardFilters

- **시나리오**: KANBAN-028~034, 045
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-derived-state.md`
  - `.claude/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md`
  - `.claude/skills/vercel-react-best-practices/rules/js-set-map-lookups.md`
- **구현 대상**:
  - `components/kanban/board-filters.tsx` — 검색 Input, 우선순위 Select, 태그 Select, 활성 필터 칩, Clear all
  - `lib/kanban/filters.ts` — 필터 로직 (AND 조합), 파생 상태로 계산
- **수용 기준**:
  - [ ] "API" 검색 → 제목에 "API" 포함 카드만 표시 (KANBAN-028)
  - [ ] 검색어 삭제 → 전체 카드 복원 (KANBAN-029)
  - [ ] "xyz123" → "검색 결과가 없습니다" (KANBAN-030)
  - [ ] 우선순위 "High" 필터 → High만 (KANBAN-031)
  - [ ] 태그 "Backend" 필터 → Backend만 (KANBAN-032)
  - [ ] 복합 필터 AND (KANBAN-033)
  - [ ] 필터 해제 → 전체 복원 (KANBAN-034)
  - [ ] 검색 + 필터 동시 적용 (KANBAN-045)
- **커밋**: `feat: implement search and filter with AND logic`

---

### Task 11: 다크모드 — ThemeToggle

- **시나리오**: KANBAN-035~037
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md`
  - `.claude/skills/vercel-react-best-practices/rules/client-localstorage-schema.md`
  - `.claude/skills/shadcn/rules/styling.md`
- **구현 대상**:
  - `components/kanban/theme-toggle.tsx` — Switch 컴포넌트, system prefers-color-scheme 감지
  - `lib/kanban/theme.ts` — 테마 상태 관리, localStorage 저장, 초기 로드 시 시스템 감지
  - `app/layout.tsx` 업데이트 — 인라인 스크립트로 FOUC 방지
- **수용 기준**:
  - [ ] 다크모드 토글 → 다크 테마 적용 (KANBAN-035)
  - [ ] 새로고침 후 다크모드 유지 (KANBAN-036)
  - [ ] 시스템 다크모드 → 첫 접속 시 자동 적용 (KANBAN-037)
  - [ ] 라이트→다크 전환 시 깜빡임 없음
- **커밋**: `feat: implement dark mode with system detection`

---

### Task 12: 통합 테스트 + 최종 검증

- **시나리오**: KANBAN-001 ~ KANBAN-045 (전체)
- **참조 규칙**:
  - `CLAUDE.md` (테스트 실행 규칙)
  - `web-design-guidelines` (최종 UI 검토)
- **구현 대상**:
  - 구현 단위 테스트 보강 (`__tests__/kanban-*.test.tsx`)
  - 전체 spec 테스트 통과 확인
- **수용 기준**:
  - [ ] `bun run test` — 모든 spec 테스트(*.spec.test.tsx) 통과
  - [ ] `bun run test` — 모든 구현 테스트(*.test.tsx) 통과
  - [ ] 에러/경고 0개
- **커밋**: `test: add unit tests and verify all kanban scenarios`

---

## 미결정 사항

- (없음 — 모든 항목이 결정됨)
