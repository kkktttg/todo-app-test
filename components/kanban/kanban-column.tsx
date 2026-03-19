"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CardCreateDialog } from "./card-create-dialog"
import { KanbanCard } from "./kanban-card"
import { useKanban } from "@/lib/kanban/context"
import type { Column } from "@/lib/kanban/types"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus, Trash } from "@phosphor-icons/react"

interface KanbanColumnProps {
  column: Column
  allColumns: { id: string; name: string }[]
  filteredCardIds: Set<string>
  hasNoResults: boolean
}

export function KanbanColumn({ column, allColumns, filteredCardIds, hasNoResults }: KanbanColumnProps) {
  const { state, dispatch } = useKanban()
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(column.name)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef } = useDroppable({ id: column.id })

  const cards = column.cardIds
    .map((id) => state.cards[id])
    .filter(Boolean)

  const visibleCards = cards.filter((card) => filteredCardIds.has(card.id))

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function saveName() {
    if (nameValue.trim() && nameValue !== column.name) {
      dispatch({ type: "RENAME_COLUMN", payload: { columnId: column.id, name: nameValue.trim() } })
    } else {
      setNameValue(column.name)
    }
    setEditing(false)
  }

  function handleDeleteColumn() {
    if (cards.length === 0) {
      dispatch({ type: "DELETE_COLUMN", payload: { columnId: column.id } })
    } else {
      setShowDeleteDialog(true)
    }
  }

  function confirmDelete() {
    dispatch({ type: "DELETE_COLUMN", payload: { columnId: column.id } })
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        role="region"
        aria-label={`column: ${column.name}`}
        className="flex flex-col w-64 shrink-0 bg-muted/30 rounded-lg"
      >
        {/* Column Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          {editing ? (
            <Input
              ref={inputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName()
                if (e.key === "Escape") {
                  setNameValue(column.name)
                  setEditing(false)
                }
              }}
              className="h-7 text-sm font-medium"
            />
          ) : (
            <button
              className="font-medium text-sm hover:underline cursor-pointer"
              onDoubleClick={() => setEditing(true)}
              onClick={() => setEditing(true)}
              aria-label={column.name}
            >
              {column.name}
            </button>
          )}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{cards.length}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="카드 추가"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="칼럼 삭제"
              onClick={handleDeleteColumn}
            >
              <Trash size={14} />
            </Button>
          </div>
        </div>

        {/* Cards */}
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
            {visibleCards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                columnId={column.id}
                cardIndex={column.cardIds.indexOf(card.id)}
                totalCards={cards.length}
                allColumns={allColumns}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      <CardCreateDialog
        open={showCreateDialog}
        columnId={column.id}
        onOpenChange={setShowCreateDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>칼럼 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{column.name}" 칼럼과 포함된 {cards.length}개의 카드가 모두 삭제됩니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
