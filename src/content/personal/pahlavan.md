---
title: "Pahlavan"
kind: "Obsidian plugin and AI coach"
order: 2
description: >-
  A science-based AI fitness coach that lives in your Obsidian vault. The
  plugin shows today's session, your progress and your plan; a coach in Claude
  Code designs the plan and writes you a letter every Sunday. Your data stays
  in plain files you own.
image: "pahlavan.png"
imageAlt: "Pahlavan's Home screen: today's session, Full Body B, with a readiness note, a swap and the week's ring, above what needs you and food and habits"
tags:
  - "Obsidian"
  - "TypeScript"
  - "Claude Code"
  - "Fitness"
links:
  - label: "Obsidian"
    url: "https://community.obsidian.md/plugins/pahlavan"
  - label: "GitHub"
    url: "https://github.com/saeed1262/pahlavan"
  - label: "Watch the 97-second demo"
    url: "https://youtu.be/X5PZv5TxVdM"
  - label: "Report an issue"
    url: "https://github.com/saeed1262/pahlavan/issues"
gallery:
  - title: "The screens"
    items:
      - image: "pahlavan/plan.png"
        caption: "Plan · 24 weeks of phases, blocks, light weeks and tests"
        alt: "Pahlavan's Plan tab: the 24-week timeline of phases, mesocycles, light weeks, tests and decisions, with this block's weeks below it"
      - image: "pahlavan/progress.png"
        caption: "Progress · this week's sets per muscle, and your consistency"
        alt: "Pahlavan's Progress tab: the body map of this week's sets per muscle against their targets, beside readiness and the consistency grid"
      - image: "pahlavan/habits.png"
        caption: "Habits · stand-ups, sitting time and desk breaks against their targets"
        alt: "Pahlavan's habits at the desk: stand-ups, sitting time and desk breaks over the last four weeks, each day against its target"
      - image: "pahlavan/home-dark.png"
        caption: "Home · in dark mode"
        alt: "Pahlavan's Home screen in dark mode: today's session, the week's ring, what needs you, and food and habits"
---

I built Pahlavan for my own training. Every fitness plugin I tried could record a set, but none could tell me what to lift next week, or why. So I wrote a coach that does, then separated it from my notes and setup so it works in any vault.

The name is Persian for a champion, the wrestlers and heroes of the old stories. The logo's two meels are the clubs pahlavans swing in the zurkhaneh, the traditional house of strength.

## Two parts, one engine

Pahlavan is a plugin, the screens you see in Obsidian, and a coach you talk to in [Claude Code](https://claude.com/claude-code). Both read and write the same files in your vault, and both take their numbers from one engine, so a number on a screen and a number in a letter always agree.

- **Home and Today.** The session to do, the sets and reps to aim for, how to do each movement and why it's in your plan. A morning check-in tells it how ready you are, and a low morning makes the session easier instead of cancelling it.
- **Progress.** A body map of the sets each muscle got this week against its target, a strength trend for each logged lift, your consistency over the months, your weight trend, and your body record and photos.
- **Plan.** Your 24 weeks in phases, each made of 4-week blocks that end in a light week, with the reason behind every exercise.
- **Habits.** Supplements, water, protein and your own ticks, plus stand-ups, sitting time and desk breaks for days at a desk.

## The coach

The `/fitness-coach` skill does the thinking the screens can't.

- **Intake.** A safety screen, a short interview and an optional body assessment from photos.
- **The plan.** At least three options designed from your answers, each one checked by the engine, with the evidence and its grade for every major choice.
- **The Sunday check-in.** It reads your week and writes you a short letter with one thing to focus on.
- **The rest, when you want it.** Block reviews, progress reports, an eating plan, habit suggestions, and logging or questions in plain words.

## Built on research, and honest about it

Each of the coach's rules names where it comes from: 98 linked sources, most of them from 2020 or later. A rule is graded strong, moderate or weak, and one that is only a sensible default is called a heuristic instead of being dressed up as science. The engine checks every plan against the rules before it is written, and a movement your injury limits rule out always blocks the plan.

## Privacy

Your training lives in plain JSON and Markdown files in your vault. The plugin makes no network requests: no analytics, no telemetry, no ads. When you talk to the coach, Claude Code sends your messages and the files it reads to Anthropic under your own account, as it does for anything else you do in Claude Code.

## How it's built

A TypeScript engine with the plugin and the coach on top of it, bundled with esbuild and tested from the numbers up to the screens. A self-check, run each time the coach is built, fails if the coach's instructions and the engine disagree. The screenshots on this page show a made-up athlete. Pahlavan runs on desktop Obsidian, is tested on macOS, and is source-available under the Elastic License 2.0.

## Install

In Obsidian, open **Settings → Community plugins**, choose **Browse**, search for **Pahlavan**, then **Install** and **Enable**. Open it from the ribbon: the welcome card's first step sets up the coach. Then open Claude Code in your vault's folder and type `/fitness-coach intake`, and after that `/fitness-coach plan`.

You need Obsidian 1.7.2 or later on a computer. The coach also needs Claude Code, which comes with Claude plans that include it, and Node.js 18 or later. Pahlavan is free during the beta. 1.0 will be paid, and everyone who installs before then keeps it free.
