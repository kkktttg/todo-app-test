import type { BoardState } from "./types"
import { STORAGE_KEY_VERSIONED, DEFAULT_BOARD_STATE } from "./constants"

export function loadBoardState(): BoardState {
  try {
    const data = localStorage.getItem(STORAGE_KEY_VERSIONED)
    if (!data) return DEFAULT_BOARD_STATE
    const parsed = JSON.parse(data) as BoardState
    // Basic validation
    if (!parsed.columns || !parsed.cards || !parsed.tags || !parsed.columnOrder) {
      return DEFAULT_BOARD_STATE
    }
    return parsed
  } catch {
    return DEFAULT_BOARD_STATE
  }
}

export function saveBoardState(state: BoardState): void {
  try {
    localStorage.setItem(STORAGE_KEY_VERSIONED, JSON.stringify(state))
  } catch {
    // Silently fail (incognito, quota exceeded)
  }
}
