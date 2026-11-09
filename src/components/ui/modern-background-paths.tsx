"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

// Isfahan tile patterns (defined as mask images in tokens.css). The hero
// cross-fades between them, the way the plugin lets you pick one.
const PATTERNS = ["--girih", "--khatam", "--shamseh", "--jali"]

function TileLayer({ pattern, visible }: { pattern: string; visible: boolean }) {
  const mask = `var(${pattern}) center / 64px 64px, radial-gradient(ellipse at center, #000 20%, transparent 72%)`
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 2.4, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "var(--tile)",
          opacity: "calc(var(--tile-o) * 2.2)",
          WebkitMask: mask,
          mask,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />
    </motion.div>
  )
}

// A shamseh (sun) rosette: an 8-point star of two squares, petals and rings.
function Rosette({ still }: { still: boolean }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5)
  const draw = (delay: number) =>
    still
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 3.2, delay, ease: "easeInOut" as const },
        }
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className="absolute left-1/2 top-1/2 w-[min(92vw,44rem)] -translate-x-1/2 -translate-y-1/2"
      animate={still ? undefined : { rotate: 360 }}
      transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
      style={{ opacity: 0.24 }}
    >
      <g fill="none" stroke="var(--accent-from)" strokeWidth="1" strokeLinejoin="round">
        <motion.circle cx="200" cy="200" r="190" {...draw(0)} />
        <motion.circle cx="200" cy="200" r="178" strokeDasharray="2 6" {...draw(0.2)} />
        <motion.path d="M200 40 L360 200 L200 360 L40 200 Z" {...draw(0.4)} />
        <motion.path d="M87 87 H313 V313 H87 Z" {...draw(0.6)} />
        {petals.map((a, i) => (
          <motion.path
            key={a}
            d="M200 200 C214 168, 214 128, 200 96 C186 128, 186 168, 200 200 Z"
            transform={`rotate(${a} 200 200)`}
            stroke={i % 2 ? "var(--accent-to)" : "var(--accent-from)"}
            {...draw(0.8 + i * 0.05)}
          />
        ))}
        <motion.circle cx="200" cy="200" r="110" {...draw(1.2)} />
        <motion.circle cx="200" cy="200" r="22" stroke="var(--accent-to)" {...draw(1.4)} />
      </g>
    </motion.svg>
  )
}

type HeroLink = { label: string; href: string; primary?: boolean }

export default function EnhancedBackgroundPaths({
  title = "Isfahan",
  eyebrow = "",
  summary = "",
  links = [],
}: {
  title?: string
  eyebrow?: string
  summary?: string
  links?: HeroLink[]
}) {
  const still = useReducedMotion() ?? false
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (still) return
    const id = setInterval(() => setCurrent((p) => (p + 1) % PATTERNS.length), 9000)
    return () => clearInterval(id)
  }, [still])

  return (
    <div className="relative min-h-[82svh] w-full flex items-center justify-center overflow-hidden bg-transparent pt-24 pb-16">
      {/* Color wash, then the tile lattice, then the rosette */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "var(--wash)" }} />
      {PATTERNS.map((p, i) => (
        <TileLayer key={p} pattern={p} visible={i === current} />
      ))}
      <Rosette still={still} />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 60%, var(--bg))" }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 48% 40% at center, var(--bg) 0%, transparent 100%)", opacity: 0.85 }}
      />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="mb-8">
            {eyebrow && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-5 text-sm sm:text-base tracking-[0.25em]"
                style={{ color: "var(--gold-text)", fontVariant: "small-caps", marginBottom: "1.25rem" }}
              >
                {eyebrow}
              </motion.p>
            )}
            <div className="group relative inline-block">
              <motion.h1
                initial={still ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                className="text-6xl sm:text-8xl md:text-9xl leading-none"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--text)" }}
              >
                {title}
              </motion.h1>
              {/* a mihrab arch that draws in on hover */}
              <svg aria-hidden="true" viewBox="0 0 300 24" preserveAspectRatio="none" className="pointer-events-none absolute left-0 top-full mt-3 h-5 w-full overflow-visible">
                <path d="M0 22 C40 22, 90 16, 130 8 C140 6, 146 3, 150 1 C154 3, 160 6, 170 8 C210 16, 260 22, 300 22" pathLength={1} fill="none" strokeLinecap="round" style={{ stroke: "var(--gold)", strokeWidth: 1.6 }} className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-700 ease-out group-hover:[stroke-dashoffset:0] motion-reduce:transition-none" />
              </svg>
            </div>
          </div>
          {summary && (
            <motion.p
              initial={still ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
              className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed"
              style={{ color: "var(--text-muted)", marginTop: "2.75rem" }}
            >
              {summary}
            </motion.p>
          )}
          {links.length > 0 && (
            <motion.div
              initial={still ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-3"
              style={{ marginTop: "2rem" }}
            >
              {links.map((l) => {
                const external = l.href.startsWith("http")
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    {...(external ? { target: "_blank", rel: "noopener" } : {})}
                    className={`hero-btn${l.primary ? " hero-btn--primary" : ""}`}
                  >
                    {l.label}
                  </a>
                )
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
