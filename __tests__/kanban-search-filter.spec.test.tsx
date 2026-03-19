/**
 * Spec tests: Search and Filter
 * Scenarios: KANBAN-028~034, 045
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

async function addCard(user: ReturnType<typeof userEvent.setup>, title: string, priority?: string) {
  await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
  await user.type(screen.getByRole("textbox", { name: /제목/i }), title)
  if (priority) {
    await user.click(screen.getByRole("combobox", { name: /우선순위/i }))
    await user.click(screen.getByRole("option", { name: priority }))
  }
  await user.click(screen.getByRole("button", { name: /생성/i }))
}

describe("KANBAN-028: 제목 검색 - 일치 결과", () => {
  it("API 검색 시 API 설계 카드만 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "API 설계")
    await addCard(user, "DB 설계")
    await addCard(user, "화면 디자인")

    await user.type(screen.getByRole("searchbox", { name: /검색/i }), "API")

    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
      expect(screen.queryByText("DB 설계")).not.toBeInTheDocument()
      expect(screen.queryByText("화면 디자인")).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-029: 제목 검색 - 검색어 삭제", () => {
  it("검색어를 모두 삭제하면 전체 카드가 복원된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "API 설계")
    await addCard(user, "DB 설계")
    await addCard(user, "화면 디자인")

    const searchInput = screen.getByRole("searchbox", { name: /검색/i })
    await user.type(searchInput, "API")
    await user.clear(searchInput)

    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
      expect(screen.getByText("DB 설계")).toBeInTheDocument()
      expect(screen.getByText("화면 디자인")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-030: 제목 검색 - 결과 없음", () => {
  it("xyz123 검색 시 검색 결과가 없습니다 메시지가 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "API 설계")

    await user.type(screen.getByRole("searchbox", { name: /검색/i }), "xyz123")

    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument()
    })
  })
})

describe("KANBAN-031: 우선순위 필터", () => {
  it("우선순위 High 필터 시 High 카드만 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "High 카드", "High")
    await addCard(user, "Medium 카드 1", "Medium")
    await addCard(user, "Medium 카드 2", "Medium")

    await user.click(screen.getByRole("combobox", { name: /우선순위 필터/i }))
    await user.click(screen.getByRole("option", { name: "High" }))

    await waitFor(() => {
      expect(screen.getByText("High 카드")).toBeInTheDocument()
      expect(screen.queryByText("Medium 카드 1")).not.toBeInTheDocument()
      expect(screen.queryByText("Medium 카드 2")).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-032: 태그 필터", () => {
  it("Backend 태그 필터 시 Backend 카드만 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()

    // Create tag
    await user.click(screen.getByRole("button", { name: /태그 관리/i }))
    await user.type(screen.getByRole("textbox", { name: /태그 이름/i }), "Backend")
    await user.click(screen.getByRole("button", { name: /파란색/i }))
    await user.click(screen.getByRole("button", { name: /태그 생성/i }))

    // Create cards
    await addCard(user, "Backend 카드 1")
    await addCard(user, "Backend 카드 2")
    await addCard(user, "일반 카드")

    // Add Backend tag to first two cards
    for (const title of ["Backend 카드 1", "Backend 카드 2"]) {
      await user.click(screen.getByText(title))
      await user.click(screen.getByRole("button", { name: /태그 추가/i }))
      await user.click(screen.getByRole("option", { name: "Backend" }))
      await user.keyboard("{Escape}")
    }

    // Filter by Backend tag
    await user.click(screen.getByRole("combobox", { name: /태그 필터/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))

    await waitFor(() => {
      expect(screen.getByText("Backend 카드 1")).toBeInTheDocument()
      expect(screen.getByText("Backend 카드 2")).toBeInTheDocument()
      expect(screen.queryByText("일반 카드")).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-033: 복합 필터 (AND)", () => {
  it("우선순위 High + 태그 Backend AND 필터 시 조건 만족 카드 1개만 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()

    // Create Backend tag
    await user.click(screen.getByRole("button", { name: /태그 관리/i }))
    await user.type(screen.getByRole("textbox", { name: /태그 이름/i }), "Backend")
    await user.click(screen.getByRole("button", { name: /파란색/i }))
    await user.click(screen.getByRole("button", { name: /태그 생성/i }))

    await addCard(user, "High+Backend", "High")
    await addCard(user, "High+Frontend", "High")
    await addCard(user, "Low+Backend", "Low")

    // Add Backend tag
    await user.click(screen.getByText("High+Backend"))
    await user.click(screen.getByRole("button", { name: /태그 추가/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))
    await user.keyboard("{Escape}")

    await user.click(screen.getByText("Low+Backend"))
    await user.click(screen.getByRole("button", { name: /태그 추가/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))
    await user.keyboard("{Escape}")

    // Apply both filters
    await user.click(screen.getByRole("combobox", { name: /우선순위 필터/i }))
    await user.click(screen.getByRole("option", { name: "High" }))
    await user.click(screen.getByRole("combobox", { name: /태그 필터/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))

    await waitFor(() => {
      expect(screen.getByText("High+Backend")).toBeInTheDocument()
      expect(screen.queryByText("High+Frontend")).not.toBeInTheDocument()
      expect(screen.queryByText("Low+Backend")).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-034: 필터 해제", () => {
  it("필터 해제 시 전체 카드가 복원된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "High 카드", "High")
    await addCard(user, "Medium 카드")
    await addCard(user, "Low 카드", "Low")

    // Apply filter
    await user.click(screen.getByRole("combobox", { name: /우선순위 필터/i }))
    await user.click(screen.getByRole("option", { name: "High" }))

    // Clear filter
    await user.click(screen.getByRole("button", { name: /필터 초기화/i }))

    await waitFor(() => {
      expect(screen.getByText("High 카드")).toBeInTheDocument()
      expect(screen.getByText("Medium 카드")).toBeInTheDocument()
      expect(screen.getByText("Low 카드")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-045: 검색과 필터 동시 적용", () => {
  it("검색 API + 우선순위 High 동시 적용 시 API 설계(High)만 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "API 설계", "High")
    await addCard(user, "API 문서화", "Low")
    await addCard(user, "DB 설계", "High")

    await user.type(screen.getByRole("searchbox", { name: /검색/i }), "API")
    await user.click(screen.getByRole("combobox", { name: /우선순위 필터/i }))
    await user.click(screen.getByRole("option", { name: "High" }))

    await waitFor(() => {
      expect(screen.getByText("API 설계")).toBeInTheDocument()
      expect(screen.queryByText("API 문서화")).not.toBeInTheDocument()
      expect(screen.queryByText("DB 설계")).not.toBeInTheDocument()
    })
  })
})
