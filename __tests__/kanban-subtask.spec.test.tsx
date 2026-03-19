/**
 * Spec tests: Subtasks
 * Scenarios: KANBAN-017~020
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

async function createCardAndOpen(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getAllByRole("button", { name: /카드 추가/i })[0])
  await user.type(screen.getByRole("textbox", { name: /제목/i }), title)
  await user.click(screen.getByRole("button", { name: /생성/i }))
  await user.click(screen.getByText(title))
}

describe("KANBAN-017: 서브태스크 추가", () => {
  it("서브태스크 DB 스키마 작성 추가 시 체크리스트에 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCardAndOpen(user, "API 설계")

    await user.type(screen.getByRole("textbox", { name: /서브태스크 추가/i }), "DB 스키마 작성")
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(screen.getByText("DB 스키마 작성")).toBeInTheDocument()
      expect(screen.getAllByRole("checkbox")).toHaveLength(1)
    })
  })
})

describe("KANBAN-018: 서브태스크 진행률", () => {
  it("3개 중 2개 체크 시 진행률 2/3이 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCardAndOpen(user, "API 설계")

    const subtaskInput = screen.getByRole("textbox", { name: /서브태스크 추가/i })
    await user.type(subtaskInput, "작업 1")
    await user.keyboard("{Enter}")
    await user.type(subtaskInput, "작업 2")
    await user.keyboard("{Enter}")
    await user.type(subtaskInput, "작업 3")
    await user.keyboard("{Enter}")

    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])

    await waitFor(() => {
      expect(screen.getByText("2/3")).toBeInTheDocument()
    })
  })
})

describe("KANBAN-019: 서브태스크 삭제", () => {
  it("서브태스크 삭제 버튼 클릭 시 해당 서브태스크가 제거된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCardAndOpen(user, "API 설계")

    await user.type(screen.getByRole("textbox", { name: /서브태스크 추가/i }), "DB 스키마 작성")
    await user.keyboard("{Enter}")

    expect(screen.getByText("DB 스키마 작성")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /서브태스크 삭제/i }))

    await waitFor(() => {
      expect(screen.queryByText("DB 스키마 작성")).not.toBeInTheDocument()
    })
  })
})

describe("KANBAN-020: 모든 서브태스크 완료", () => {
  it("모든 서브태스크 체크 시 진행률 3/3이 표시된다", async () => {
    const user = userEvent.setup()
    renderBoard()
    await createCardAndOpen(user, "API 설계")

    const subtaskInput = screen.getByRole("textbox", { name: /서브태스크 추가/i })
    await user.type(subtaskInput, "작업 1")
    await user.keyboard("{Enter}")
    await user.type(subtaskInput, "작업 2")
    await user.keyboard("{Enter}")
    await user.type(subtaskInput, "작업 3")
    await user.keyboard("{Enter}")

    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])
    await user.click(checkboxes[2])

    await waitFor(() => {
      expect(screen.getByText("3/3")).toBeInTheDocument()
    })
  })
})
