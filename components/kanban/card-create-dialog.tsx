"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKanban } from "@/lib/kanban/context"
import type { Priority } from "@/lib/kanban/types"
import { PRIORITIES } from "@/lib/kanban/constants"

function generateId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface CardCreateDialogProps {
  open: boolean
  columnId: string
  onOpenChange: (open: boolean) => void
}

export function CardCreateDialog({ open, columnId, onOpenChange }: CardCreateDialogProps) {
  const { dispatch } = useKanban()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority | "">("")
  const [dueDate, setDueDate] = useState("")
  const [assignee, setAssignee] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [error, setError] = useState("")

  function reset() {
    setTitle("")
    setDescription("")
    setPriority("")
    setDueDate("")
    setAssignee("")
    setCoverImageUrl("")
    setError("")
  }

  function handleSubmit() {
    if (!title.trim()) {
      setError("제목을 입력해주세요")
      return
    }
    const now = new Date().toISOString()
    dispatch({
      type: "ADD_CARD",
      payload: {
        columnId,
        card: {
          id: generateId(),
          title: title.trim(),
          description: description.trim(),
          priority: (priority as Priority) || null,
          tagIds: [],
          dueDate: dueDate || null,
          assignee: assignee.trim() || null,
          subtasks: [],
          coverImageUrl: coverImageUrl.trim() || null,
          createdAt: now,
          modifiedAt: now,
        },
      },
    })
    reset()
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카드 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="card-title">제목 *</Label>
            <Input
              id="card-title"
              aria-label="제목"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError("")
              }}
              placeholder="카드 제목을 입력하세요"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-description">설명</Label>
            <Textarea
              id="card-description"
              aria-label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 (선택)"
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <Label>우선순위</Label>
            <Select
              value={priority || "__none__"}
              onValueChange={(v) => setPriority(v === "__none__" ? "" : (v as Priority))}
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

          <div className="space-y-1">
            <Label htmlFor="card-duedate">마감일</Label>
            <Input
              id="card-duedate"
              aria-label="마감일"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-assignee">담당자</Label>
            <Input
              id="card-assignee"
              aria-label="담당자"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="담당자 이름"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-cover">커버 이미지 URL</Label>
            <Input
              id="card-cover"
              aria-label="커버 이미지"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} aria-label="생성">
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
