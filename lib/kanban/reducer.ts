import type { BoardState, Card, Column, Tag, Subtask, Priority } from "./types"

export type BoardAction =
  | { type: "ADD_COLUMN"; payload: { id: string; name: string } }
  | { type: "RENAME_COLUMN"; payload: { columnId: string; name: string } }
  | { type: "DELETE_COLUMN"; payload: { columnId: string } }
  | { type: "ADD_CARD"; payload: { columnId: string; card: Card } }
  | { type: "UPDATE_CARD"; payload: { cardId: string; changes: Partial<Card> } }
  | { type: "DELETE_CARD"; payload: { cardId: string } }
  | { type: "MOVE_CARD"; payload: { cardId: string; fromColumnId: string; toColumnId: string; toIndex: number } }
  | { type: "REORDER_CARD"; payload: { columnId: string; fromIndex: number; toIndex: number } }
  | { type: "ADD_SUBTASK"; payload: { cardId: string; subtask: Subtask } }
  | { type: "TOGGLE_SUBTASK"; payload: { cardId: string; subtaskId: string } }
  | { type: "DELETE_SUBTASK"; payload: { cardId: string; subtaskId: string } }
  | { type: "ADD_TAG"; payload: { tag: Tag } }
  | { type: "DELETE_TAG"; payload: { tagId: string } }
  | { type: "ADD_TAG_TO_CARD"; payload: { cardId: string; tagId: string } }
  | { type: "REMOVE_TAG_FROM_CARD"; payload: { cardId: string; tagId: string } }

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "ADD_COLUMN": {
      const { id, name } = action.payload
      const newColumn: Column = { id, name, cardIds: [] }
      return {
        ...state,
        columns: [...state.columns, newColumn],
        columnOrder: [...state.columnOrder, id],
      }
    }

    case "RENAME_COLUMN": {
      const { columnId, name } = action.payload
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, name } : col
        ),
      }
    }

    case "DELETE_COLUMN": {
      const { columnId } = action.payload
      const column = state.columns.find((c) => c.id === columnId)
      if (!column) return state

      const newCards = { ...state.cards }
      column.cardIds.forEach((cardId) => delete newCards[cardId])

      return {
        ...state,
        columns: state.columns.filter((c) => c.id !== columnId),
        columnOrder: state.columnOrder.filter((id) => id !== columnId),
        cards: newCards,
      }
    }

    case "ADD_CARD": {
      const { columnId, card } = action.payload
      return {
        ...state,
        cards: { ...state.cards, [card.id]: card },
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, cardIds: [...col.cardIds, card.id] }
            : col
        ),
      }
    }

    case "UPDATE_CARD": {
      const { cardId, changes } = action.payload
      const existing = state.cards[cardId]
      if (!existing) return state
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...existing, ...changes, modifiedAt: new Date().toISOString() },
        },
      }
    }

    case "DELETE_CARD": {
      const { cardId } = action.payload
      const newCards = { ...state.cards }
      delete newCards[cardId]
      return {
        ...state,
        cards: newCards,
        columns: state.columns.map((col) => ({
          ...col,
          cardIds: col.cardIds.filter((id) => id !== cardId),
        })),
      }
    }

    case "MOVE_CARD": {
      const { cardId, fromColumnId, toColumnId, toIndex } = action.payload
      const fromColumn = state.columns.find((c) => c.id === fromColumnId)
      const toColumn = state.columns.find((c) => c.id === toColumnId)
      if (!fromColumn || !toColumn) return state

      const fromCardIds = fromColumn.cardIds.filter((id) => id !== cardId)
      let toCardIds = toColumn.cardIds.filter((id) => id !== cardId)
      toCardIds = [
        ...toCardIds.slice(0, toIndex),
        cardId,
        ...toCardIds.slice(toIndex),
      ]

      return {
        ...state,
        columns: state.columns.map((col) => {
          if (col.id === fromColumnId) return { ...col, cardIds: fromCardIds }
          if (col.id === toColumnId) return { ...col, cardIds: toCardIds }
          return col
        }),
      }
    }

    case "REORDER_CARD": {
      const { columnId, fromIndex, toIndex } = action.payload
      const column = state.columns.find((c) => c.id === columnId)
      if (!column) return state

      const cardIds = [...column.cardIds]
      const [moved] = cardIds.splice(fromIndex, 1)
      cardIds.splice(toIndex, 0, moved)

      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, cardIds } : col
        ),
      }
    }

    case "ADD_SUBTASK": {
      const { cardId, subtask } = action.payload
      const card = state.cards[cardId]
      if (!card) return state
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            subtasks: [...card.subtasks, subtask],
            modifiedAt: new Date().toISOString(),
          },
        },
      }
    }

    case "TOGGLE_SUBTASK": {
      const { cardId, subtaskId } = action.payload
      const card = state.cards[cardId]
      if (!card) return state
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            subtasks: card.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
            modifiedAt: new Date().toISOString(),
          },
        },
      }
    }

    case "DELETE_SUBTASK": {
      const { cardId, subtaskId } = action.payload
      const card = state.cards[cardId]
      if (!card) return state
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            subtasks: card.subtasks.filter((s) => s.id !== subtaskId),
            modifiedAt: new Date().toISOString(),
          },
        },
      }
    }

    case "ADD_TAG": {
      const { tag } = action.payload
      return {
        ...state,
        tags: { ...state.tags, [tag.id]: tag },
      }
    }

    case "DELETE_TAG": {
      const { tagId } = action.payload
      const newTags = { ...state.tags }
      delete newTags[tagId]
      const newCards = Object.fromEntries(
        Object.entries(state.cards).map(([id, card]) => [
          id,
          { ...card, tagIds: card.tagIds.filter((tid) => tid !== tagId) },
        ])
      )
      return { ...state, tags: newTags, cards: newCards }
    }

    case "ADD_TAG_TO_CARD": {
      const { cardId, tagId } = action.payload
      const card = state.cards[cardId]
      if (!card || card.tagIds.includes(tagId)) return state
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, tagIds: [...card.tagIds, tagId], modifiedAt: new Date().toISOString() },
        },
      }
    }

    case "REMOVE_TAG_FROM_CARD": {
      const { cardId, tagId } = action.payload
      const card = state.cards[cardId]
      if (!card) return state
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            tagIds: card.tagIds.filter((tid) => tid !== tagId),
            modifiedAt: new Date().toISOString(),
          },
        },
      }
    }

    default:
      return state
  }
}
