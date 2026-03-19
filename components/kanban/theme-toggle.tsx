"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { loadTheme, saveTheme, applyTheme, type Theme } from "@/lib/kanban/theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const t = loadTheme()
    setTheme(t)
    applyTheme(t)
  }, [])

  function toggle(checked: boolean) {
    const next: Theme = checked ? "dark" : "light"
    setTheme(next)
    saveTheme(next)
    applyTheme(next)
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="dark-mode-toggle"
        aria-label="다크모드"
        checked={theme === "dark"}
        onCheckedChange={toggle}
      />
      <Label htmlFor="dark-mode-toggle">다크모드</Label>
    </div>
  )
}
