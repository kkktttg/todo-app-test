import { THEME_STORAGE_KEY } from "./constants"

export type Theme = "light" | "dark"

export function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === "dark" || saved === "light") return saved
    // System preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  } catch {}
  return "light"
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {}
}

export function applyTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}
