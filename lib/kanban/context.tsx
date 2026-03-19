"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import type { BoardState, Card, Tag, Subtask } from "./types"
import { boardReducer, type BoardAction } from "./reducer"
import { loadBoardState, saveBoardState } from "./storage"
import { DEFAULT_BOARD_STATE } from "./constants"

interface KanbanContextValue {
  state: BoardState
  dispatch: React.Dispatch<BoardAction>
}

const KanbanContext = createContext<KanbanContextValue | null>(null)

function initState(): BoardState {
  if (typeof window === "undefined") return DEFAULT_BOARD_STATE
  return loadBoardState()
}

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, undefined, initState)

  useEffect(() => {
    saveBoardState(state)
  }, [state])

  return (
    <KanbanContext.Provider value={{ state, dispatch }}>
      {children}
    </KanbanContext.Provider>
  )
}

export function useKanban() {
  const ctx = useContext(KanbanContext)
  if (!ctx) throw new Error("useKanban must be used within KanbanProvider")
  return ctx
}
