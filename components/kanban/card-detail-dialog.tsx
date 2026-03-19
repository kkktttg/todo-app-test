"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SubtaskList } from "./subtask-list"
import { useKanban } from "@/lib/kanban/context"
import type { Card } from "@/lib/kanban/types"
import type { Priority } from "@/lib/kanban/types"
import { PRIORITIES } from "@/lib/kanban/constants"
import { X } from "@phosphor-icons/react"

interface CardDetailDialogProps {
  card: Card
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardDetailDialog({ card, open, onOpenChange }: CardDetailDialogProps) {
  const { state, dispatch } = useKanban()
  const [titleDraft, setTitleDraft] = useState(card.title)
  const [descDraft, setDescDraft] = useState(card.description)
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setTitleDraft(card.title)
      setDescDraft(card.description)
      setTagDropdownOpen(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const cardTags = card.tagIds.map((id) => state.tags[id]).filter(Boolean)
  const availableTags = Object.values(state.tags).filter(
    (t) => !card.tagIds.includes(t.id)
  )

  function saveTitle() {
    if (!titleDraft.trim()) return
    dispatch({
      type: "UPDATE_CARD",
      payload: { cardId: card.id, changes: { title: titleDraft.trim() } },
    })
  }

  function saveDesc() {
    dispatch({
      type: "UPDATE_CARD",
      payload: { cardId: card.id, changes: { description: descDraft } },
    })
  }

  function changePriority(value: string) {
    dispatch({
      type: "UPDATE_CARD",
      payload: {
        cardId: card.id,
        changes: { priority: value === "__none__" ? null : (value as Priority) },
      },
    })
    onOpenChange(false)
  }

  function addTag(tagId: string) {
    dispatch({ type: "ADD_TAG_TO_CARD", payload: { cardId: card.id, tagId } })
    setTagDropdownOpen(false)
  }

  function removeTag(tagId: string) {
    dispatch({ type: "REMOVE_TAG_FROM_CARD", payload: { cardId: card.id, tagId } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>카드 상세</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <Label>제목</Label>
            <Input
              aria-label="제목"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveTitle()
                }
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>설명</Label>
            <Textarea
              aria-label="설명"
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveDesc()
                }
              }}
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label>우선순위</Label>
            <Select
              value={card.priority || "__none__"}
              onValueChange={changePriority}
            >
              <SelectTrigger aria-label="우선순위">
                <SelectValue placeholder="선택 안 함" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__none__">선택 안 함</SelectItem>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label>태그</Label>
            <div className="flex flex-wrap gap-1 items-center">
              {cardTags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: "#fff" }}
                  className="flex items-center gap-1 pr-1"
                >
                  {tag.name}
                  <button
                    aria-label={`${tag.name} 제거`}
                    onClick={() => removeTag(tag.id)}
                    className="ml-0.5 rounded-full hover:bg-black/20"
                  >
                    <X size={10} />
                  </button>
                </Badge>
              ))}

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  aria-label="태그 추가"
                  onClick={() => setTagDropdownOpen((v) => !v)}
                >
                  + 태그 추가
                </Button>
                {tagDropdownOpen && (
                  <div
                    className="absolute z-50 left-0 top-full mt-1 bg-popover border rounded-md shadow-md min-w-[8rem]"
                  >
                    {availableTags.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        태그 없음
                      </div>
                    ) : (
                      availableTags.map((tag) => (
                        <div
                          key={tag.id}
                          role="option"
                          aria-selected={false}
                          className="px-3 py-1.5 cursor-pointer hover:bg-accent text-sm"
                          onClick={() => addTag(tag.id)}
                        >
                          {tag.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <SubtaskList card={card} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
