# AdcommTV DevDesk

_AdcommTV · Powered by Tech-Trader_

A self-hosted ticket/work-tracking system for managing **Salesforce projects, requests, and software development** at AdcommTV.

Built on the same stack as the IHospitality CRM rebuild: **Next.js 15 (App Router) + Prisma + PostgreSQL**, Dockerized, with **Caddy** for automatic HTTPS. Auth is CRM-managed email/password with role tiers — no M365/Entra dependency.

## What it does

- **Work items** of several types — Request, Development, Bug, Enhancement, Task — each with priority, status, assignee, comments, and a full activity log.
- **Salesforce context** on every item: component (Apex, Flow, LWC, Validation Rule, Permission Set, Integration, Config…), environment (sandbox/prod), and a **deploy status** (Not started → In sandbox → In testing → Deployed to prod).
- **Projects** group work items (e.g. `SFDC — Salesforce Core`), each with a lead and status, and a per-project open/done board.
- **Dashboard** with counts by status and type, plus "assigned to me" and recently-updated.
- **Role tiers**
  - **Admin** — full control, manages users and projects.
  - **Agent** — the delivery team (devs/admins/SE): can work, assign, and resolve any item, manage projects, and post internal notes.
  - **Requester** — raises requests and sees only their own items; never sees internal notes.

## Roles → who they map to

Mirror your IHospitality pattern: you (Sam) are **Admin**; your Salesforce devs/admins are **Agents**; sales/ops staff who file requests are **Requesters**.

## Quick start (local)

```bash
cp .env.example .env
# optional: edit AUTH_SECRET
docker compose up --build
```

Then open http://localhost:3000. Demo data is seeded (`SEED_DEMO=1` by default in the dev compose):

| Login | Password | Role |
| --- | --- | --- |
| admin@adcommtv.com | admin123 | Admin |
| dev@adcommtv.com | dev123 | Agent |
| user@adcommtv.com | user123 | Requester |

> Change the admin password after first login (or set `ADMIN_PASSWORD` before first boot).

## Local dev without Docker

```bash
npm install
# point DATABASE_URL at a local Postgres in .env
npm run db:push     # create tables
npm run db:seed     # admin + (if SEED_DEMO=1) demo data
npm run dev
```

## Stack

- Next.js 15, React 19, TypeScript, Tailwind
- Prisma 6 + PostgreSQL 16
- Auth: bcrypt password hashing + signed JWT session cookie (`jose`), httpOnly
- Zod for input validation
- Server Actions (no separate REST layer)

## Project layout

```
prisma/schema.prisma      data model (User, Project, Ticket, Comment, Activity)
prisma/seed.ts            admin + demo seed
src/lib/                  prisma client, auth, session guards, labels
src/app/login             sign-in
src/app/(app)/            authenticated area: dashboard, tickets, projects, admin
```

See **DEPLOY.md** to put it on a Vultr box behind Caddy, the same way the CRM runs.
