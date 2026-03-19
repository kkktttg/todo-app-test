/**
 * Spec tests: Card CRUD
 * Scenarios: KANBAN-006~016, 041~043
 */
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { KanbanProvider } from "@/lib/kanban/context"
import KanbanBoard from "@/components/kanban/kanban-board"

function renderBoard() {
  return render(
    <KanbanProvider>
      <KanbanBoard />
    </KanbanProvider>
  )
}

async function createCard(user: ReturnType<typeof userEvent.setup>, options: {
  title: string
  description?: string
  priority?: string
  dueDate?: string
  assignee?: string
  coverImageUrl?: string
  columnIndex?: number
}) {
  const { title, description, priority, dueDate, assignee, coverImageUrl, columnIndex = 0 } = options
  const addButtons = screen.getAllByRole("button", { name: /카드 추가/i })
  await user.click(addButtons[columnIndex])

  await user.type(screen.getByRole("textbox", { name: /제목/i }), title)
  if (description) {
    await user.type(screen.getByRole("textbox", { name: /설명/i }), description)
  }
  if (priority) {
    await user.click(screen.getByRole("combobox", { name: /우선순위/i }))
    await user.click(screen.getByRole("option", { name: priority }))
  }
  if (dueDate) {
    const dueDateInput = screen.getByLabelText(/마감일/i)
    await user.type(dueDateInput, dueDate)
  }
  if (assignee) {
    await user.type(screen.getByRole("textbox", { name: /담당자/i }), assignee)
  }
  if (coverImageUrl) {
    await user.type(screen.getByRole("textbox", { name: /커버 이미지/i }), coverImageUrl)
  }
  await user.click(screen.getByRole("button", { name: /생성/i }))
}

describe("KANBAN-006: 카드 생성 - 기본 필드", () => {
  it("제목과 설명을 입력하면 카드가 Todo 칼럼에 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계", description: "REST 엔드포인트 정의" })
    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
      expect(screen.getByText("REST 엔드포인트 정의")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-007: 카드 생성 - 제목 없이 시도", () => {
  it("제목을 비워두고 생성 시도 시 오류 메시지가 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
    await user.click(screen.getByRole("button", { name: /생성/i }))
    await waitFor(() => {
      expect(screen.getByText(/제목을 입력해주세요/i)).toBeInTheDocument()
    })
  })
})

describe("KANBAN-008: 카드 생성 - 우선순위 설정", () => {
  it("우선순위 High 설정 시 High 뱃지가 카드에 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "긴급 버그 수정", priority: "High" })
    await waitFor(() => {
      expect(screen.getByText("긴급 버그 수정")).toBeInTheDocument()
      expect(screen.getByText("High")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-009: 카드 생성 - 마감일 설정", () => {
  it("마감일 설정 시 카드에 마감일이 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계", dueDate: "2026-04-01" })
    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
      expect(screen.getByText(/2026-04-01/)).toBeInTheDocument()
    })
  })
})

describe("KANBAN-010: 카드 생성 - 담당자 설정", () => {
  it("담당자 입력 시 카드에 담당자명이 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계", assignee: "김개발" })
    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
      expect(screen.getByText("김개발")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-011: 카드 생성 - 커버 이미지 URL", () => {
  it("커버 이미지 URL 입력 시 카드 상단에 이미지가 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, {
      title: "디자인 시안",
      coverImageUrl: "https://example.com/image.png",
    })
    await waitFor(() => {
      expect(screen.getByText("디자인 시안")).toBeInTheDocument()
      expect(screen.getByRole("img", { name: /커버/i })).toBeInTheDocument()
    })
  })
})

describe("KANBAN-012: 카드 제목 인라인 편집", () => {
  it("카드 제목 클릭 후 수정하면 새 제목이 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계" })

    await user.click(screen.getByText("API 설계"))
    const titleInput = screen.getByDisplayValue("API 설계")
    await user.clear(titleInput)
    await user.type(titleInput, "API 문서화")
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(screen.getByText("API 문서화")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-013: 카드 우선순위 변경", () => {
  it("우선순위 High → Low 변경 시 뱃지가 Low로 변경된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "긴급 버그 수정", priority: "High" })

    await user.click(screen.getByText("긴급 버그 수정"))
    await user.click(screen.getByRole("combobox", { name: /우선순위/i }))
    await user.click(screen.getByRole("option", { name: "Low" }))

    await waitFor(() => {
      expect(screen.getByText("Low")).toBeInTheDocument()
      expect(screen.queryByText("High")).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-043: 카드 설명 인라인 편집", () => {
  it("설명 클릭 후 수정하면 새 설명이 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계", description: "REST 엔드포인트 정의" })

    await user.click(screen.getByText("API 설계"))
    await user.click(screen.getByText("REST 엔드포인트 정의"))
    const descInput = screen.getByDisplayValue("REST 엔드포인트 정의")
    await user.clear(descInput)
    await user.type(descInput, "GraphQL 스키마 정의")
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(screen.getByText("GraphQL 스키마 정의")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-014: 카드 편집 취소", () => {
  it("편집 중 Escape 키 입력 시 원래 제목이 유지된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계" })

    await user.click(screen.getByText("API 설계"))
    const titleInput = screen.getByDisplayValue("API 설계")
    await user.clear(titleInput)
    await user.type(titleInput, "임시 수정")
    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-015: 카드 삭제 확인", () => {
  it("삭제 버튼 클릭 후 확인 시 카드가 제거된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "카드 1" })
    await createCard(user, { title: "카드 2" })
    await createCard(user, { title: "카드 3" })

    const deleteButtons = screen.getAllByRole("button", { name: /카드 삭제/i })
    await user.click(deleteButtons[0])
    await user.click(screen.getByRole("button", { name: /확인/i }))

    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(2)
    })
  })
})

describe("KANBAN-016: 카드 삭제 취소", () => {
  it("삭제 버튼 클릭 후 취소 시 카드 3개가 유지된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "카드 1" })
    await createCard(user, { title: "카드 2" })
    await createCard(user, { title: "카드 3" })

    const deleteButtons = screen.getAllByRole("button", { name: /카드 삭제/i })
    await user.click(deleteButtons[0])
    await user.click(screen.getByRole("button", { name: /취소/i }))

    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(3)
    })
  })
})

describe("KANBAN-041: 카드 생성일 자동 기록", () => {
  it("카드 생성 시 생성일이 카드에 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계" })

    await waitFor(() => {
      expect(screen.getByTestId("card-created-date")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-042: 카드 수정일 자동 갱신", () => {
  it("카드 수정 시 수정일이 갱신된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCard(user, { title: "API 설계" })

    await user.click(screen.getByText("API 설계"))
    const titleInput = screen.getByDisplayValue("API 설계")
    await user.clear(titleInput)
    await user.type(titleInput, "API 문서화")
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(screen.getByTestId("card-modified-date")).toBeInTheDocument()
    })
  })
})
