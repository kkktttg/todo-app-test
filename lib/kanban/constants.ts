import type { BoardState } from "./types"

export const STORAGE_KEY = "kanban-board"
export const STORAGE_VERSION = "v1"
export const STORAGE_KEY_VERSIONED = `${STORAGE_KEY}:${STORAGE_VERSION}`
export const THEME_STORAGE_KEY = "kanban-theme:v1"

export const PRIORITIES = ["High", "Medium", "Low"] as const

export const DEFAULT_BOARD_STATE: BoardState = {
  columns: [
    { id: "col-todo", name: "Todo", cardIds: [] },
    { id: "col-inprogress", name: "In Progress", cardIds: [] },
    { id: "col-done", name: "Done", cardIds: [] },
  ],
  cards: {},
  tags: {},
  columnOrder: ["col-todo", "col-inprogress", "col-done"],
}
