# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hackathon tracking application — retro terminal / cyberpunk aesthetic. Teams log caffeine, commits, sleep, and custom metrics in real-time during hackathon events. Multi-team, multi-hackathon, with organizer and member roles.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint 9 flat config, Next.js core-web-vitals + TypeScript)
- **Push schema:** `npx prisma db push --accept-data-loss`
- **Seed DB:** `npx tsx --env-file=.env prisma/seed.ts`

`prisma migrate dev` requires an interactive terminal — not available in Claude Code. Use `db push` instead.

No test framework is configured.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- PostgreSQL + Prisma (adapter: `@prisma/adapter-pg`)
- JWT auth via `jose`, httpOnly cookie `htrack-session`
- Recharts for charts
- Package manager: **npm**

## Architecture

- **Next.js App Router** — file-based routing in `app/`
- **Server Components by default** — use `"use client"` only where needed
- **Tailwind CSS v4** — use `@import "tailwindcss"` pattern, NOT v3 `@tailwind` directives
- **Path alias:** `@/*` maps to project root
- **5s polling** for real-time updates — no WebSockets

## Key Files

```
prisma/schema.prisma          DB schema
prisma/seed.ts                Dev seed (superadmin, organizer, hackathon, teams, members)
lib/auth.ts                   JWT session helpers + role guards (isOrganizer, isSuperadmin)
lib/types.ts                  Shared TypeScript types + NEON_COLORS
lib/prisma.ts                 Prisma client singleton
lib/chart-utils.ts            Hourly timeline bucketing for Recharts
lib/hackathon-defaults.ts     DEFAULT_METRIC_TEMPLATES + randomInviteCode (shared by seed + API)
```

## Role System

| Role | Access |
|------|--------|
| `SUPERADMIN` | Seeded via env. Full organizer access. |
| `ORGANIZER` | Creates hackathons, manages teams, approves metric proposals. Registers via `/register-organizer` + `ORGANIZER_SECRET` env var. |
| `MEMBER` | Joins teams via invite code, logs metrics, proposes new metrics. |

Session payload: `{ userId, name, color, role, teamId?, hackathonId? }`

## Route Structure

```
/login                    Login + member registration
/register-organizer       Organizer registration (requires ORGANIZER_SECRET)

/join                     Manual invite code entry
/join/[code]              Link-based join with team preview

/dashboard                Team leaderboard (MEMBER only, redirects if no team)
/dashboard/track          Personal metric logging + proposal panel
/dashboard/profile        Edit name / color / PIN

/organizer                Hackathon list (ORGANIZER / SUPERADMIN only)
/organizer/[hackathonId]  Hackathon detail: teams, metrics, proposals

/live/[hackathonId]       Public projection screen (no auth required)
```

**Dashboard layout guards:** organizers → `/organizer`; teamless members → `/join`

## API Conventions

- Responses use `[OK]`/`[ERR]` prefix in message/error strings
- Auth via `getSession()` from `lib/auth.ts`
- Organizer-only routes check `isOrganizer(session)`
- `MetricDefinition` slug is compound-unique: `@@unique([slug, hackathonId])` — use `slug_hackathonId` in Prisma where clauses

## Dev Conventions

- Slug normalization: uppercase, alphanumeric + underscores
- Neon colors live in `NEON_COLORS` constant in `lib/types.ts`
- After join/login, use `window.location.assign('/dashboard')` (full reload) to ensure session cookie is picked up by server components
- `prisma.config.ts` loads dotenv; but `tsx` still needs `--env-file=.env` explicitly
