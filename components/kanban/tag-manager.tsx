"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useKanban } from "@/lib/kanban/context"
import { Tag as TagIcon } from "@phosphor-icons/react"

const TAG_COLORS: { name: string; label: string; value: string }[] = [
  { name: "파란색", label: "파란색", value: "#3b82f6" },
  { name: "빨간색", label: "빨간색", value: "#ef4444" },
  { name: "초록색", label: "초록색", value: "#22c55e" },
  { name: "노란색", label: "노란색", value: "#eab308" },
  { name: "보라색", label: "보라색", value: "#a855f7" },
  { name: "주황색", label: "주황색", value: "#f97316" },
]

function generateId() {
  return `tag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function TagManager() {
  const { state, dispatch } = useKanban()
  const [open, setOpen] = useState(false)
  const [tagName, setTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value)

  const tags = Object.values(state.tags)

  function createTag() {
    if (!tagName.trim()) return
    dispatch({
      type: "ADD_TAG",
      payload: {
        tag: { id: generateId(), name: tagName.trim(), color: selectedColor },
      },
    })
    setTagName("")
    setSelectedColor(TAG_COLORS[0].value)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="태그 관리">
          <TagIcon size={16} />
          태그 관리
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">태그 관리</h4>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: "#fff" }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Input
              aria-label="태그 이름"
              placeholder="태그 이름"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
              className="h-8 text-sm"
            />
            <div className="flex gap-1 flex-wrap">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.value}
                  aria-label={c.label}
                  onClick={() => setSelectedColor(c.value)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor: selectedColor === c.value ? "#000" : "transparent",
                  }}
                />
              ))}
            </div>
            <Button size="sm" className="w-full" aria-label="태그 생성" onClick={createTag}>
              태그 생성
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
