"use client"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps { className?: string; class?: string }

declare global {
  interface Window { __isfahan?: { apply: () => void; hold: (dark: boolean) => void } }
}

const PHASE_NAME: Record<string, string> = { dawn: "Dawn", workday: "Workday", evening: "Evening", night: "Night" }

export function ThemeToggle({ className, class: classProp }: ThemeToggleProps) {
  const classes = className ?? classProp
  const [isDark, setIsDark] = useState(true)
  const [phase, setPhase] = useState("")
  useEffect(() => {
    // The head script picks the phase from the sun; mirror it as it changes.
    const root = document.documentElement
    const sync = () => {
      setIsDark(root.classList.contains("dark"))
      setPhase(root.getAttribute("data-phase") ?? "")
    }
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(root, { attributes: true, attributeFilter: ["class", "data-phase"] })
    return () => obs.disconnect()
  }, [])
  const toggle = () => {
    const next = !isDark
    // Hold light or dark until the next phase change; then the sun takes over again.
    if (window.__isfahan) window.__isfahan.hold(next)
    else document.documentElement.classList.toggle("dark", next)
  }
  const label = `${PHASE_NAME[phase] ?? (isDark ? "Dark" : "Light")} palette, following the sun. Switch to ${isDark ? "light" : "dark"} until the next phase.`
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
      aria-label={label}
      title={label}
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
