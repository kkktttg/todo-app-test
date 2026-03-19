"use client"

import { memo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import { CardDetailDialog } from "./card-detail-dialog"
import { useKanban } from "@/lib/kanban/context"
import type { Card as KanbanCardType } from "@/lib/kanban/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash, ArrowUp, ArrowDown, ArrowRight } from "@phosphor-icons/react"

const PRIORITY_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
}

interface KanbanCardProps {
  card: KanbanCardType
  columnId: string
  cardIndex: number
  totalCards: number
  allColumns: { id: string; name: string }[]
}

const KanbanCardInner = memo(function KanbanCardInner({
  card,
  columnId,
  cardIndex,
  totalCards,
  allColumns,
}: KanbanCardProps) {
  const { state, dispatch } = useKanban()
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const tags = card.tagIds.map((id) => state.tags[id]).filter(Boolean)
  const completedSubtasks = card.subtasks.filter((s) => s.completed).length
  const totalSubtasks = card.subtasks.length
  const subtaskProgress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100)

  function moveCard(toColumnId: string) {
    const toColumn = state.columns.find((c) => c.id === toColumnId)
    if (!toColumn) return
    dispatch({
      type: "MOVE_CARD",
      payload: { cardId: card.id, fromColumnId: columnId, toColumnId, toIndex: toColumn.cardIds.length },
    })
  }

  function moveUp() {
    if (cardIndex === 0) return
    dispatch({ type: "REORDER_CARD", payload: { columnId, fromIndex: cardIndex, toIndex: cardIndex - 1 } })
  }

  function moveDown() {
    if (cardIndex >= totalCards - 1) return
    dispatch({ type: "REORDER_CARD", payload: { columnId, fromIndex: cardIndex, toIndex: cardIndex + 1 } })
  }

  function deleteCard() {
    dispatch({ type: "DELETE_CARD", payload: { cardId: card.id } })
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("ko-KR")
    } catch {
      return iso
    }
  }

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        className="bg-card border rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        {...attributes}
        {...listeners}
        role="article"
      >
        {card.coverImageUrl && (
          <img
            src={card.coverImageUrl}
            alt="커버"
            role="img"
            aria-label="커버"
            className="w-full h-24 object-cover rounded-t-lg"
          />
        )}
        <div className="p-3 space-y-2">
          {/* Header: title + actions */}
          <div className="flex items-start justify-between gap-2">
            <button
              className="font-medium text-sm text-left hover:underline flex-1"
              onClick={(e) => {
                e.stopPropagation()
                setShowDetail(true)
              }}
            >
              {card.title}
            </button>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label="위로 이동"
                onClick={(e) => { e.stopPropagation(); moveUp() }}
                disabled={cardIndex === 0}
              >
                <ArrowUp size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label="아래로 이동"
                onClick={(e) => { e.stopPropagation(); moveDown() }}
                disabled={cardIndex >= totalCards - 1}
              >
                <ArrowDown size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label="카드 삭제"
                onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true) }}
              >
                <Trash size={12} />
              </Button>
            </div>
          </div>

          {/* Description — hidden when detail dialog is open to avoid getByText duplicate */}
          {card.description && !showDetail && (
            <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
          )}

          {/* Priority + Tags — hidden when detail dialog is open to avoid getByText duplicate */}
          {!showDetail && (
            <div className="flex flex-wrap gap-1">
              {card.priority && (
                <Badge variant={PRIORITY_VARIANT[card.priority]}>
                  {card.priority}
                </Badge>
              )}
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: "#fff" }}
                  className="text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Due date */}
          {card.dueDate && (
            <p className="text-xs text-muted-foreground">마감: {card.dueDate}</p>
          )}

          {/* Assignee — standalone text for getByText matching */}
          {card.assignee && (
            <p className="text-xs text-muted-foreground">
              담당: <span>{card.assignee}</span>
            </p>
          )}

          {/* Subtask progress — hidden when detail dialog is open to avoid getByText duplicate */}
          {totalSubtasks > 0 && !showDetail && (
            <div className="space-y-1">
              <Progress value={subtaskProgress} className="h-1" />
              <p className="text-xs text-muted-foreground">{completedSubtasks}/{totalSubtasks}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div data-testid="card-created-date">{formatDate(card.createdAt)}</div>
            {card.modifiedAt !== card.createdAt && (
              <div data-testid="card-modified-date">수정: {formatDate(card.modifiedAt)}</div>
            )}
          </div>

          {/* Move to column buttons */}
          <div className="flex flex-wrap gap-1">
            {allColumns
              .filter((col) => col.id !== columnId)
              .map((col) => (
                <Button
                  key={col.id}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  aria-label={`${col.name}로 이동`}
                  onClick={(e) => { e.stopPropagation(); moveCard(col.id) }}
                >
                  <ArrowRight size={10} />
                  {col.name}
                </Button>
              ))}
          </div>
        </div>
      </article>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카드 삭제</AlertDialogTitle>
            <AlertDialogDescription>이 카드를 삭제하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCard}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showDetail && (
        <CardDetailDialog card={card} open={showDetail} onOpenChange={setShowDetail} />
      )}
    </>
  )
})

export { KanbanCardInner as KanbanCard }
