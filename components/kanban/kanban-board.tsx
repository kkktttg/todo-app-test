"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KanbanColumn } from "./kanban-column"
import { TagManager } from "./tag-manager"
import { BoardFilters } from "./board-filters"
import { ThemeToggle } from "./theme-toggle"
import { useKanban } from "@/lib/kanban/context"
import { filterCards, type FilterState } from "@/lib/kanban/filters"
import { Plus } from "@phosphor-icons/react"

const INITIAL_FILTERS: FilterState = { searchQuery: "", priorityFilter: "", tagFilter: "" }

function generateId() {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function KanbanBoard() {
  const { state, dispatch } = useKanban()
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filteredCardIds = filterCards(state.cards, filters, state.tags)
  const hasActiveFilters =
    filters.searchQuery !== "" || filters.priorityFilter !== "" || filters.tagFilter !== ""

  const totalVisibleCards = state.columnOrder.reduce((sum, colId) => {
    const col = state.columns.find((c) => c.id === colId)
    if (!col) return sum
    return sum + col.cardIds.filter((id) => filteredCardIds.has(id)).length
  }, 0)

  const totalCards = Object.keys(state.cards).length
  const hasNoResults = hasActiveFilters && totalCards > 0 && totalVisibleCards === 0

  const allColumns = state.columnOrder
    .map((id) => state.columns.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ id: c!.id, name: c!.name }))

  function addColumn() {
    if (!newColumnName.trim()) return
    dispatch({
      type: "ADD_COLUMN",
      payload: { id: generateId(), name: newColumnName.trim() },
    })
    setNewColumnName("")
    setAddingColumn(false)
  }

  function onDragStart(event: DragStartEvent) {
    setActiveCardId(event.active.id as string)
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCardId(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source column
    const sourceColumn = state.columns.find((col) => col.cardIds.includes(activeId))
    if (!sourceColumn) return

    // Target is a column or a card
    const targetColumn = state.columns.find(
      (col) => col.id === overId || col.cardIds.includes(overId)
    )
    if (!targetColumn) return

    if (sourceColumn.id === targetColumn.id) {
      // Same column reorder
      const fromIndex = sourceColumn.cardIds.indexOf(activeId)
      const toIndex = overId === targetColumn.id
        ? sourceColumn.cardIds.length - 1
        : targetColumn.cardIds.indexOf(overId)
      if (fromIndex !== toIndex) {
        dispatch({
          type: "REORDER_CARD",
          payload: { columnId: sourceColumn.id, fromIndex, toIndex },
        })
      }
    } else {
      // Cross-column move
      const toIndex = overId === targetColumn.id
        ? targetColumn.cardIds.length
        : targetColumn.cardIds.indexOf(overId)
      dispatch({
        type: "MOVE_CARD",
        payload: {
          cardId: activeId,
          fromColumnId: sourceColumn.id,
          toColumnId: targetColumn.id,
          toIndex,
        },
      })
    }
  }

  const activeCard = activeCardId ? state.cards[activeCardId] : null

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="font-semibold text-lg">Kanban Board</h1>
        <div className="flex items-center gap-2">
          <TagManager />
          <ThemeToggle />
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 py-2 border-b bg-background">
        <BoardFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <ScrollArea className="h-full w-full">
            <div className="flex gap-4 p-4 h-full min-h-0">
              {state.columnOrder.map((colId) => {
                const column = state.columns.find((c) => c.id === colId)
                if (!column) return null
                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    allColumns={allColumns}
                    filteredCardIds={filteredCardIds}
                    hasNoResults={hasNoResults}
                  />
                )
              })}

              {/* Add Column */}
              <div className="shrink-0 w-64">
                {addingColumn ? (
                  <div className="flex gap-2">
                    <Input
                      aria-label="칼럼 이름"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addColumn()
                        if (e.key === "Escape") {
                          setAddingColumn(false)
                          setNewColumnName("")
                        }
                      }}
                      placeholder="칼럼 이름..."
                      autoFocus
                    />
                    <Button onClick={addColumn} size="sm">추가</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setAddingColumn(false); setNewColumnName("") }}
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setAddingColumn(true)}
                    aria-label="칼럼 추가"
                  >
                    <Plus size={16} />
                    칼럼 추가
                  </Button>
                )}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DragOverlay>
            {activeCard && (
              <div className="bg-card border rounded-lg shadow-lg p-3 w-64 opacity-90">
                <p className="font-medium text-sm">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* No results overlay */}
      {hasNoResults && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-muted-foreground text-lg">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  )
}
