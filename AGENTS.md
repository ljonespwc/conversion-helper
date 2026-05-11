# EasyAsk Agent Start Here

This file is the canonical quick-start for AI agents working in this repo.
Keep it short. Put long product context in docs, not here.

## Read First

Before making non-trivial changes, read these in order:

1. `docs/MINDSET.md` - Lance's operating rules. Simple, explicit, no overbuild.
2. `docs/PROGRESS.md` - technical architecture, sensitive areas, and project history.
3. `docs/PROJECT_CONTEXT.md` - product positioning, value prop, and messaging.

## Project

EasyAsk is a conversational AI widget for websites. It helps visitors ask natural-language questions and get answers grounded in the customer's own scraped pages and uploaded docs via Gemini File Search.

Live app: `https://easyask.io`
Supabase project: `fwimhxkkszdaogugslar` (`Conversion Helper`)

## Hard Rules

- Do only what Lance explicitly asks for.
- Do not add features, automation, infrastructure, abstractions, or "best practices" unless the request or project docs specifically call for them.
- Keep changes simple enough for a solo dev to read, explain, and own.
- Do not leave TODOs, dead code, future hooks, or half-built flows unless Lance explicitly asks for scaffolding.
- Do not start the Next.js dev server.
- Do not deploy to production.

## Sensitive Areas

Do not modify these without explicit permission:

- AI prompting, model configuration, Gemini File Search query structure, metadata filters, or conversation-history handling.
- Widget UI/UX: `ChatInterface`, `WidgetModal`, `WidgetButton`, animations, layout, or embedded iframe behavior.
- Production database schema or data outside an agreed safe schema workflow.

## Supabase Safe Schema Workflow

Production data exists, including the PN organization. Treat schema changes as production work.

Use the linked Supabase project:

```bash
npx supabase db query --linked "select 1"
```

Rules:

- Always use `--linked` for remote queries. Without it, the CLI targets local Postgres and may try to involve Docker.
- Do not set up Docker for this repo.
- Do not run blind `npx supabase db push`; local migration filenames/history are not fully reconciled with remote migration history.
- For schema changes, create an explicit SQL migration file, review it, apply it intentionally with `npx supabase db query --linked -f path/to/file.sql`, then verify with read-only queries.
- Prefer additive, reversible changes. Avoid destructive schema/data changes unless Lance explicitly approves the exact operation.
- For risky migrations, first test the SQL inside a transaction with `rollback`.

## Division of Responsibilities

Lance handles:

- Starting `npm run dev`
- Production deploys
- Manual browser QA

Codex/agents handle:

- Code edits
- Local builds and type checks
- Read-only investigation
- Safe Supabase queries and intentional migrations
- Debugging from logs and source

## Useful Commands

```bash
npm run build
npx tsc --noEmit
npm run test:run
npx supabase db query --linked "select current_user, current_database()"
```
