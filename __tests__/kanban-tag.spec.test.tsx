/**
 * Spec tests: Tag management
 * Scenarios: KANBAN-024~027
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

async function createTagAndCard(user: ReturnType<typeof userEvent.setup>) {
  // Create tag via tag manager
  await user.click(screen.getByRole("button", { name: /태그 관리/i }))
  await user.type(screen.getByRole("textbox", { name: /태그 이름/i }), "Backend")
  await user.click(screen.getByRole("button", { name: /파란색/i }))
  await user.click(screen.getByRole("button", { name: /태그 생성/i }))

  // Create a card
  await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
  await user.type(screen.getByRole("textbox", { name: /제목/i }), "API 설계")
  await user.click(screen.getByRole("button", { name: /생성/i }))
}

describe("KANBAN-024: 태그 생성", () => {
  it("Backend 태그 + 파란색 생성 시 태그 목록에 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()

    await user.click(screen.getByRole("button", { name: /태그 관리/i }))
    await user.type(screen.getByRole("textbox", { name: /태그 이름/i }), "Backend")
    await user.click(screen.getByRole("button", { name: /파란색/i }))
    await user.click(screen.getByRole("button", { name: /태그 생성/i }))

    await waitFor(() => {
      expect(screen.getByText("Backend")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-025: 카드에 태그 추가", () => {
  it("카드에 Backend 태그 추가 시 뱃지가 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createTagAndCard(user)

    await user.click(screen.getByText("API 설계"))
    await user.click(screen.getByRole("button", { name: /태그 추가/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))

    await waitFor(() => {
      expect(screen.getByText("Backend")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-026: 카드에서 태그 제거", () => {
  it("카드에서 Backend 태그 제거 시 뱃지가 사라진다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createTagAndCard(user)

    // Add tag to card
    await user.click(screen.getByText("API 설계"))
    await user.click(screen.getByRole("button", { name: /태그 추가/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))
    await waitFor(() => expect(screen.getByText("Backend")).toBeInTheDocument())

    // Remove tag
    await user.click(screen.getByRole("button", { name: /Backend 제거/i }))

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Backend 제거/i })).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-027: 카드에 복수 태그 추가", () => {
  it("Backend와 Urgent 태그를 추가 시 두 뱃지가 모두 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()

    // Create two tags
    await user.click(screen.getByRole("button", { name: /태그 관리/i }))
    await user.type(screen.getByRole("textbox", { name: /태그 이름/i }), "Backend")
    await user.click(screen.getByRole("button", { name: /파란색/i }))
    await user.click(screen.getByRole("button", { name: /태그 생성/i }))
    await user.type(screen.getByRole("textbox", { name: /태그 이름/i }), "Urgent")
    await user.click(screen.getByRole("button", { name: /빨간색/i }))
    await user.click(screen.getByRole("button", { name: /태그 생성/i }))

    // Create card
    await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "API 설계")
    await user.click(screen.getByRole("button", { name: /생성/i }))

    // Add both tags
    await user.click(screen.getByText("API 설계"))
    await user.click(screen.getByRole("button", { name: /태그 추가/i }))
    await user.click(screen.getByRole("option", { name: "Backend" }))
    await user.click(screen.getByRole("button", { name: /태그 추가/i }))
    await user.click(screen.getByRole("option", { name: "Urgent" }))

    await waitFor(() => {
      expect(screen.getAllByText("Backend")).toBeTruthy()
      expect(screen.getAllByText("Urgent")).toBeTruthy()
    })
  })
})
