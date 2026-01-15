# Flight Strip Demo - Agent Guide

## Project Overview

This is an **Air Tower Flight Strip Demo** application that simulates an air traffic control system for managing flight arrivals and departures. The application displays flight information organized by runways, helping air traffic controllers track and manage aircraft movements.

The demo is designed to showcase real-time flight strip management in a tower environment, with features for populating sample data and visualizing flight schedules.

## Tech Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Database**: SQLite (via libsql)
- **ORM**: Drizzle ORM
- **Styling**: CSS Modules + Global CSS with CSS Variables
- **Runtime**: Node.js

### Database & ORM Details

- **ORM Tool**: Drizzle Kit (for migrations and schema management)
- **Database Client**: `@libsql/client` 0.17
- **Database File**: `database.db` (SQLite file in project root)

## Folder Structure

```
flight-strip/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   └── ...
│   ├── components/               # Reusable React components
│   │   └── ...
│   ├── db/                       # Database schema and configuration
│   │   └── schema.ts             # Drizzle ORM schema definitions
│   ├── instrumentation.ts        # Next.js instrumentation (DB setup)
│   └── index.ts                  # Entry point utilities
├── public/                       # Static assets
└── ...                           # Various configuration files
```

## Important Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build production bundle
```

### Code Quality
```bash
npm run lint         # Run ESLint to check for code issues
```

### Database Management
```bash
npm run db:update    # Push schema changes to database (Drizzle Kit)
```

## Agent Guidelines

### After Code Generation

**CRITICAL**: After generating or modifying code, agents MUST follow this checklist:

1. Build the Application
2. Check for Linter Errors
3. Database Migrations (**if** you modified `src/db/schema.ts`)

### Code Style Guidelines

- **Styling**: Use CSS Modules for component-specific styles, global CSS variables for theme colors
- **Color Scheme**: Dark theme with CSS variables defined in `globals.css`:
  - `--bg-dark`: Dark gray background
  - `--fg-light`: Light foreground
  - `--accent-light`: Accent color
- **Layout**: All content should use the `Container` component (1280px fixed width, centered)
- **Components**: Place reusable components in `src/components/`
- **Server Components**: Next.js 16 uses Server Components by default; use `'use client'` directive only when needed
