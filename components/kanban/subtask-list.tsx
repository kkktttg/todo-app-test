"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useKanban } from "@/lib/kanban/context"
import type { Card } from "@/lib/kanban/types"
import { X } from "@phosphor-icons/react"

function generateId() {
  return `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface SubtaskListProps {
  card: Card
}

export function SubtaskList({ card }: SubtaskListProps) {
  const { dispatch } = useKanban()
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const completed = card.subtasks.filter((s) => s.completed).length
  const total = card.subtasks.length
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100)

  function addSubtask() {
    if (!newSubtaskTitle.trim()) return
    dispatch({
      type: "ADD_SUBTASK",
      payload: {
        cardId: card.id,
        subtask: { id: generateId(), title: newSubtaskTitle.trim(), completed: false },
      },
    })
    setNewSubtaskTitle("")
  }

  function toggleSubtask(subtaskId: string) {
    dispatch({ type: "TOGGLE_SUBTASK", payload: { cardId: card.id, subtaskId } })
  }

  function deleteSubtask(subtaskId: string) {
    dispatch({ type: "DELETE_SUBTASK", payload: { cardId: card.id, subtaskId } })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>서브태스크</span>
        {total > 0 && (
          <span aria-label="subtask-progress">
            {completed}/{total}
          </span>
        )}
      </div>
      {total > 0 && (
        <Progress value={progressPercent} className="h-1.5" aria-label="서브태스크 진행률" />
      )}
      <ul className="space-y-1">
        {card.subtasks.map((subtask) => (
          <li key={subtask.id} className="flex items-center gap-2">
            <Checkbox
              id={`subtask-${subtask.id}`}
              checked={subtask.completed}
              onCheckedChange={() => toggleSubtask(subtask.id)}
              aria-label={subtask.title}
            />
            <label
              htmlFor={`subtask-${subtask.id}`}
              className={`flex-1 text-sm cursor-pointer ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {subtask.title}
            </label>
            <Button
              variant="ghost"
              size="icon"
              aria-label="서브태스크 삭제"
              onClick={() => deleteSubtask(subtask.id)}
              className="h-5 w-5"
            >
              <X size={12} />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          aria-label="서브태스크 추가"
          placeholder="새 서브태스크..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addSubtask()
            }
          }}
          className="h-7 text-sm"
        />
      </div>
    </div>
  )
}
