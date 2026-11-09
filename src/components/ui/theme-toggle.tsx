"use client"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps { className?: string; class?: string }

export function ThemeToggle({ className, class: classProp }: ThemeToggleProps) {
  const classes = className ?? classProp
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    // The head script already picked the theme (saved choice, else system);
    // mirror it, and keep mirroring if the system theme changes later.
    const root = document.documentElement
    setIsDark(root.classList.contains("dark"))
    const obs = new MutationObserver(() => setIsDark(root.classList.contains("dark")))
    obs.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])
  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("theme", next ? "dark" : "light") } catch (e) {}
  }
  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        "bg-[var(--surface)] border border-[var(--border)]",
        classes
      )}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-label="Toggle color theme"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle() } }}
    >
      <div className="flex justify-between items-center w-full">
        <div className={cn("flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300", isDark ? "transform translate-x-0 bg-[var(--bg-deep)]" : "transform translate-x-8 bg-[var(--bg-deep)]")}>
          {isDark ? <Moon className="w-4 h-4 text-[var(--gold)]" strokeWidth={1.5} /> : <Sun className="w-4 h-4 text-[var(--accent-from)]" strokeWidth={1.5} />}
        </div>
        <div className={cn("flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300", isDark ? "bg-transparent" : "transform -translate-x-8")}>
          {isDark ? <Sun className="w-4 h-4 text-[var(--text-muted)]" strokeWidth={1.5} /> : <Moon className="w-4 h-4 text-[var(--text-muted)]" strokeWidth={1.5} />}
        </div>
      </div>
    </div>
  )
}
