export type Priority = "High" | "Medium" | "Low"

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Card {
  id: string
  title: string
  description: string
  priority: Priority | null
  tagIds: string[]
  dueDate: string | null
  assignee: string | null
  subtasks: Subtask[]
  coverImageUrl: string | null
  createdAt: string
  modifiedAt: string
}

export interface Column {
  id: string
  name: string
  cardIds: string[]
}

export interface BoardState {
  columns: Column[]
  cards: Record<string, Card>
  tags: Record<string, Tag>
  columnOrder: string[]
}
