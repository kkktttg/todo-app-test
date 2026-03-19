"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKanban } from "@/lib/kanban/context"
import type { FilterState } from "@/lib/kanban/filters"
import { PRIORITIES } from "@/lib/kanban/constants"
import { X } from "@phosphor-icons/react"

interface BoardFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function BoardFilters({ filters, onChange }: BoardFiltersProps) {
  const { state } = useKanban()
  const tags = Object.values(state.tags)
  const hasActiveFilters =
    filters.searchQuery !== "" || filters.priorityFilter !== "" || filters.tagFilter !== ""

  function clearAll() {
    onChange({ searchQuery: "", priorityFilter: "", tagFilter: "" })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        role="searchbox"
        aria-label="검색"
        placeholder="카드 검색..."
        value={filters.searchQuery}
        onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
        className="h-8 w-48 text-sm"
      />

      <Select
        value={filters.priorityFilter || "__all__"}
        onValueChange={(v) =>
          onChange({ ...filters, priorityFilter: v === "__all__" ? "" : v })
        }
      >
        <SelectTrigger className="h-8 w-36 text-sm" aria-label="우선순위 필터">
          <SelectValue placeholder="우선순위" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="__all__">전체</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {tags.length > 0 && (
        <Select
          value={filters.tagFilter || "__all__"}
          onValueChange={(v) =>
            onChange({ ...filters, tagFilter: v === "__all__" ? "" : v })
          }
        >
          <SelectTrigger className="h-8 w-36 text-sm" aria-label="태그 필터">
            <SelectValue placeholder="태그" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__all__">전체</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          aria-label="필터 초기화"
          className="h-8 gap-1"
        >
          <X size={14} />
          초기화
        </Button>
      )}
    </div>
  )
}
