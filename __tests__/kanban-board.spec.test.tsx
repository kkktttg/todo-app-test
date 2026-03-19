/**
 * Spec tests: Column management
 * Scenarios: KANBAN-001, 002, 003, 004, 005, 044
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
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

describe("KANBAN-001: 기본 칼럼 초기 표시", () => {
  it("초기 접속 시 Todo, In Progress, Done 3개 칼럼이 표시된다", () => {
    renderBoard()
    expect(screen.getByText("Todo")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
    expect(screen.getByText("Done")).toBeInTheDocument()
    expect(screen.getAllByRole("region", { name: /column/i })).toHaveLength(3)
  })
})

describe("KANBAN-002: 칼럼 추가", () => {
  it("칼럼 추가 버튼 클릭 후 QA 입력 시 4번째 칼럼이 생성된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(screen.getByRole("button", { name: /칼럼 추가/i }))
    const input = screen.getByRole("textbox", { name: /칼럼 이름/i })
    await user.type(input, "QA")
    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.getByText("QA")).toBeInTheDocument()
      expect(screen.getAllByRole("region", { name: /column/i })).toHaveLength(4)
    })
  })
})

describe("KANBAN-003: 칼럼 이름 변경", () => {
  it("In Progress 칼럼 헤더를 클릭하고 진행 중으로 수정한다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.dblClick(screen.getByText("In Progress"))
    const input = screen.getByDisplayValue("In Progress")
    await user.clear(input)
    await user.type(input, "진행 중")
    await user.keyboard("{Enter}")
    await waitFor(() => {
      expect(screen.getByText("진행 중")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-004: 빈 칼럼 삭제", () => {
  it("카드가 없는 Done 칼럼 삭제 시 즉시 제거된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    const deleteButtons = screen.getAllByRole("button", { name: /칼럼 삭제/i })
    // Done is the 3rd column
    await user.click(deleteButtons[2])
    await waitFor(() => {
      expect(screen.queryByText("Done")).not.toBeInTheDocument()
      expect(screen.getAllByRole("region", { name: /column/i })).toHaveLength(2)
    })
  })
})

describe("KANBAN-005: 카드가 있는 칼럼 삭제 시 확인", () => {
  it("카드가 있는 칼럼 삭제 시 확인 다이얼로그가 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()

    // Add a card to Todo column first
    await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
    const titleInput = screen.getByRole("textbox", { name: /제목/i })
    await user.type(titleInput, "테스트 카드")
    await user.click(screen.getByRole("button", { name: /생성/i }))

    const deleteButtons = screen.getAllByRole("button", { name: /칼럼 삭제/i })
    await user.click(deleteButtons[0])
    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-044: 카드가 있는 칼럼 삭제 확인 후 실행", () => {
  it("확인 다이얼로그에서 확인 클릭 시 칼럼과 카드가 모두 삭제된다", async () => {
    const user = userEvent.setup()
    renderBoard()

    // Add a card to Todo column
    await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
    await user.type(screen.getByRole("textbox", { name: /제목/i }), "테스트 카드")
    await user.click(screen.getByRole("button", { name: /생성/i }))

    // Delete column
    const deleteButtons = screen.getAllByRole("button", { name: /칼럼 삭제/i })
    await user.click(deleteButtons[0])

    // Confirm
    await user.click(screen.getByRole("button", { name: /확인/i }))
    await waitFor(() => {
      expect(screen.queryByText("Todo")).not.toBeInTheDocument()
      expect(screen.getAllByRole("region", { name: /column/i })).toHaveLength(2)
    })
  })
})
