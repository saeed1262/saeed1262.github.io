"use client"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps { className?: string; class?: string }

export function ThemeToggle({ className, class: classProp }: ThemeToggleProps) {
  const classes = className ?? classProp
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null
    const dark = stored ? stored === "dark" : document.documentElement.classList.contains("dark")
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
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
        isDark ? "bg-zinc-950 border border-zinc-800" : "bg-white border border-zinc-200",
        classes
      )}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-label="Toggle color theme"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle() } }}
    >
      <div className="flex justify-between items-center w-full">
        <div className={cn("flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300", isDark ? "transform translate-x-0 bg-zinc-800" : "transform translate-x-8 bg-gray-200")}>
          {isDark ? <Moon className="w-4 h-4 text-white" strokeWidth={1.5} /> : <Sun className="w-4 h-4 text-gray-700" strokeWidth={1.5} />}
        </div>
        <div className={cn("flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300", isDark ? "bg-transparent" : "transform -translate-x-8")}>
          {isDark ? <Sun className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> : <Moon className="w-4 h-4 text-black" strokeWidth={1.5} />}
        </div>
      </div>
    </div>
  )
}
