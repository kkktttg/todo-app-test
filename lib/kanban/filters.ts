import type { BoardState, Card } from "./types"

export interface FilterState {
  searchQuery: string
  priorityFilter: string
  tagFilter: string
}

export function filterCards(
  cards: Record<string, Card>,
  filters: FilterState,
  tags: BoardState["tags"]
): Set<string> {
  const { searchQuery, priorityFilter, tagFilter } = filters
  const hasSearch = searchQuery.trim().length > 0
  const hasPriority = priorityFilter !== ""
  const hasTag = tagFilter !== ""

  if (!hasSearch && !hasPriority && !hasTag) return new Set(Object.keys(cards))

  const result = new Set<string>()

  for (const [id, card] of Object.entries(cards)) {
    if (hasSearch && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) continue
    if (hasPriority && card.priority !== priorityFilter) continue
    if (hasTag) {
      const tag = Object.values(tags).find((t) => t.name === tagFilter)
      if (!tag || !card.tagIds.includes(tag.id)) continue
    }
    result.add(id)
  }

  return result
}
