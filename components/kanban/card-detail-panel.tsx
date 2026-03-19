"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SubtaskList } from "./subtask-list"
import { useKanban } from "@/lib/kanban/context"
import type { Card, Priority } from "@/lib/kanban/types"
import { PRIORITIES } from "@/lib/kanban/constants"
import { Trash, X, Plus } from "@phosphor-icons/react"
import { Separator } from "@/components/ui/separator"

const PRIORITY_COLORS: Record<Priority, string> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
}

interface CardDetailPanelProps {
  card: Card
  onClose: () => void
}

export function CardDetailPanel({ card, onClose }: CardDetailPanelProps) {
  const { state, dispatch } = useKanban()
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [titleValue, setTitleValue] = useState(card.title)
  const [descriptionValue, setDescriptionValue] = useState(card.description)
  const titleRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)

  const tags = Object.values(state.tags)
  const cardTags = card.tagIds.map((id) => state.tags[id]).filter(Boolean)
  const availableTags = tags.filter((t) => !card.tagIds.includes(t.id))

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus()
  }, [editingTitle])

  useEffect(() => {
    if (editingDescription) descRef.current?.focus()
  }, [editingDescription])

  // Sync when card changes externally
  useEffect(() => {
    setTitleValue(card.title)
    setDescriptionValue(card.description)
  }, [card.title, card.description])

  function saveTitle() {
    if (titleValue.trim() && titleValue !== card.title) {
      dispatch({ type: "UPDATE_CARD", payload: { cardId: card.id, changes: { title: titleValue.trim() } } })
    } else {
      setTitleValue(card.title)
    }
    setEditingTitle(false)
  }

  function cancelTitle() {
    setTitleValue(card.title)
    setEditingTitle(false)
  }

  function saveDescription() {
    dispatch({ type: "UPDATE_CARD", payload: { cardId: card.id, changes: { description: descriptionValue } } })
    setEditingDescription(false)
  }

  function cancelDescription() {
    setDescriptionValue(card.description)
    setEditingDescription(false)
  }

  function deleteCard() {
    dispatch({ type: "DELETE_CARD", payload: { cardId: card.id } })
    onClose()
  }

  function changePriority(value: string) {
    const p = value === "__none__" ? null : value as Priority
    dispatch({ type: "UPDATE_CARD", payload: { cardId: card.id, changes: { priority: p } } })
  }

  function addTag(tagId: string) {
    dispatch({ type: "ADD_TAG_TO_CARD", payload: { cardId: card.id, tagId } })
  }

  function removeTag(tagId: string) {
    dispatch({ type: "REMOVE_TAG_FROM_CARD", payload: { cardId: card.id, tagId } })
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("ko-KR")
    } catch {
      return iso
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-card border-l shadow-lg flex flex-col z-10" role="complementary" aria-label="카드 상세">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">카드 상세</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
          <X size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          {editingTitle ? (
            <Input
              ref={titleRef}
              aria-label="제목"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle()
                if (e.key === "Escape") cancelTitle()
              }}
            />
          ) : (
            <h3
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => setEditingTitle(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(true)}
            >
              {card.title}
            </h3>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">우선순위</Label>
          <Select
            value={card.priority ?? "__none__"}
            onValueChange={changePriority}
          >
            <SelectTrigger className="h-8 text-sm" aria-label="우선순위">
              <SelectValue placeholder="선택 안 함" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="__none__">선택 안 함</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">설명</Label>
          {editingDescription ? (
            <Textarea
              ref={descRef}
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onBlur={saveDescription}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelDescription()
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  saveDescription()
                }
              }}
              rows={3}
            />
          ) : (
            <p
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground min-h-[2rem]"
              onClick={() => setEditingDescription(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setEditingDescription(true)}
            >
              {card.description || "설명 추가..."}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">태그</Label>
          <div className="flex flex-wrap gap-1">
            {cardTags.map((tag) => (
              <Badge
                key={tag.id}
                style={{ backgroundColor: tag.color, color: "#fff" }}
                className="gap-1"
              >
                {tag.name}
                <button
                  aria-label={`${tag.name} 제거`}
                  onClick={() => removeTag(tag.id)}
                  className="ml-1 hover:opacity-70"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            {availableTags.length > 0 && (
              <Select onValueChange={addTag}>
                <SelectTrigger className="h-6 w-24 text-xs" aria-label="태그 추가">
                  <Plus size={12} />
                  <SelectValue placeholder="태그 추가" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Separator />

        {/* Subtasks */}
        <SubtaskList card={card} />

        <Separator />

        {/* Dates */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div data-testid="card-created-date">
            생성일: {formatDate(card.createdAt)}
          </div>
          <div data-testid="card-modified-date">
            수정일: {formatDate(card.modifiedAt)}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full gap-2" aria-label="카드 삭제">
              <Trash size={14} />
              카드 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>카드 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 카드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={deleteCard}>확인</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
