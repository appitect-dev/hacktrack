# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hackathon tracking application built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4. Currently in early scaffold stage from `create-next-app`.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Start production:** `npm run start`
- **Lint:** `npm run lint` (ESLint 9 flat config with Next.js core-web-vitals + TypeScript rules)

No test framework is configured yet.

## Architecture

- **Next.js App Router** with file-based routing in `app/`
- **Server Components** by default (use `"use client"` directive for client components)
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin — styles imported with `@import "tailwindcss"` in `app/globals.css`
- **Path alias:** `@/*` maps to the project root
- **Fonts:** Geist Sans and Geist Mono loaded via `next/font` in root layout
- **Dark mode:** CSS custom properties with `prefers-color-scheme` media query

## Tech Stack

- Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4
- Package manager: npm
- No database, auth, or state management configured yet
