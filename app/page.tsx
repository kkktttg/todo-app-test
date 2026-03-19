import { KanbanProvider } from "@/lib/kanban/context"
import KanbanBoard from "@/components/kanban/kanban-board"

export default function Page() {
  return (
    <KanbanProvider>
      <KanbanBoard />
    </KanbanProvider>
  )
}
