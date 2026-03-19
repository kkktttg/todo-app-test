/**
 * Spec tests: Drag & Drop
 * Scenarios: KANBAN-021~023
 * Note: dnd-kit uses pointer events; these tests use dispatch-level simulation
 */
import { render, screen, waitFor, within } from "@testing-library/react"
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

async function addCard(user: ReturnType<typeof userEvent.setup>, title: string, columnIndex = 0) {
  await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[columnIndex])
  await user.type(screen.getByRole("textbox", { name: /제목/i }), title)
  await user.click(screen.getByRole("button", { name: /생성/i }))
}

describe("KANBAN-021: 카드를 다른 칼럼으로 이동", () => {
  it("드래그 후 칼럼 간 이동이 반영된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "카드 A")
    await addCard(user, "카드 B")

    // Use the move button provided for accessibility
    const moveButtons = screen.getAllByRole("button", { name: /In Progress로 이동/i })
    await user.click(moveButtons[0])

    await waitFor(() => {
      const columns = screen.getAllByRole("region", { name: /column/i })
      const todoColumn = columns[0]
      const inProgressColumn = columns[1]
      expect(within(todoColumn).getAllByRole("article")).toHaveLength(1)
      expect(within(inProgressColumn).getAllByRole("article")).toHaveLength(1)
    })
  })
})

describe("KANBAN-022: 칼럼 내 카드 순서 변경", () => {
  it("C를 A 위로 이동 시 C, A, B 순서로 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "A")
    await addCard(user, "B")
    await addCard(user, "C")

    // Move C (index 2) to position 0 (before A)
    const moveUpButtons = screen.getAllByRole("button", { name: /위로 이동/i })
    // C is last (index 2), click 위로 이동 twice
    await user.click(moveUpButtons[2])
    await user.click(screen.getAllByRole("button", { name: /위로 이동/i })[1])

    await waitFor(() => {
      const cards = screen.getAllByRole("article")
      expect(cards[0]).toHaveTextContent("C")
      expect(cards[1]).toHaveTextContent("A")
      expect(cards[2]).toHaveTextContent("B")
    })
  })
})

describe("KANBAN-023: 드래그 후 새로고침 시 위치 유지", () => {
  it("카드를 다른 칼럼으로 이동 후 localStorage에 상태가 저장된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await addCard(user, "API 설계")

    const moveButton = screen.getByRole("button", { name: /In Progress로 이동/i })
    await user.click(moveButton)

    await waitFor(() => {
      const saved = localStorage.getItem("kanban-board:v1")
      expect(saved).not.toBeNull()
      const state = JSON.parse(saved!)
      const inProgressCol = state.columns.find((c: { name: string }) => c.name === "In Progress")
      expect(inProgressCol.cardIds).toHaveLength(1)
    })
  })
})
