/**
 * Spec tests: Dark mode
 * Scenarios: KANBAN-035~037
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

describe("KANBAN-035: 다크모드 토글", () => {
  it("다크모드 토글 클릭 시 document에 dark 클래스가 추가된다", async () => {
    const user = userEvent.setup()
    document.documentElement.classList.remove("dark")
    renderBoard()

    await user.click(screen.getByRole("switch", { name: /다크모드/i }))

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })
})

describe("KANBAN-036: 다크모드 설정 유지", () => {
  it("다크모드 적용 후 localStorage에 dark가 저장된다", async () => {
    const user = userEvent.setup()
    localStorage.removeItem("kanban-theme:v1")
    document.documentElement.classList.remove("dark")
    renderBoard()

    await user.click(screen.getByRole("switch", { name: /다크모드/i }))

    await waitFor(() => {
      expect(localStorage.getItem("kanban-theme:v1")).toBe("dark")
    })
  })
})

describe("KANBAN-037: 시스템 다크모드 자동 감지", () => {
  it("시스템 다크모드 설정 시 첫 로드에 다크모드가 자동 적용된다", async () => {
    localStorage.removeItem("kanban-theme:v1")
    document.documentElement.classList.remove("dark")

    // Mock system dark mode preference
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })

    renderBoard()

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })
})
