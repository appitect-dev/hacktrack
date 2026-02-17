# HACKTRACK

Retro terminal-style hackathon fuel tracker. Teams log their caffeine intake, commits, sleep deprivation, and any custom metrics in real-time during a hackathon event.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL + Prisma · JWT auth (httpOnly cookie) · Recharts

---

## Setup

```bash
npm install

# Copy and fill in your env vars
cp .env.example .env

# Push schema to DB
npx prisma db push --accept-data-loss

# Seed dev data (superadmin, organizer, sample hackathon, 2 teams, 4 members)
npx tsx --env-file=.env prisma/seed.ts

# Start dev server
npm run dev
```

### Required env vars

```
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET=            # Any long random string
ORGANIZER_SECRET=      # Secret key for organizer self-registration

# Optional — override seed defaults
SUPERADMIN_NAME=ADMIN
SUPERADMIN_PIN=0000
ORGANIZER_NAME=ORGANIZER
ORGANIZER_PIN=1234
```

---

## Roles

| Role | How to get it | Access |
|------|--------------|--------|
| `SUPERADMIN` | Seeded via env | Everything an ORGANIZER has |
| `ORGANIZER` | Register at `/register-organizer` with `ORGANIZER_SECRET` | Create/manage hackathons, teams, approve proposals |
| `MEMBER` | Register at `/login` | Join a team, log metrics, propose new metrics |

---

## Dev seed credentials

| Role | Handle | PIN | Lands on |
|------|--------|-----|---------|
| SUPERADMIN | `ADMIN` | `0000` | `/organizer` |
| ORGANIZER | `ORGANIZER` | `1234` | `/organizer` |
| Member (captain) | `ALICE` | `1111` | `/dashboard` — Team Alpha |
| Member | `BOB` | `2222` | `/dashboard` — Team Alpha |
| Member (captain) | `CAROL` | `3333` | `/dashboard` — Team Beta |
| Member | `DAVE` | `4444` | `/dashboard` — Team Beta |

Invite codes: **ALPH** (Team Alpha) · **BETA** (Team Beta)

---

## How it works

### Organizer flow

1. Log in → lands on `/organizer`
2. **Create a hackathon** — `[ + NEW ]`, set name and start/end dates. Starts as `DRAFT`
3. **Activate** — click `ACTIVATE`. This:
   - Sets the hackathon to `ACTIVE` (only one allowed at a time)
   - Seeds default metric definitions (RED BULL, COFFEE, SLEEP, COMMITS) if none exist
4. **Create teams** — on the hackathon detail page, `[ + ADD TEAM ]`, pick name and neon color. Each team gets a random 4-char invite code
5. **Share invite links** — each team card shows its code and a full join URL (`/join/XXXX`). `COPY LINK` copies it to clipboard
6. **Review metric proposals** — at the bottom of the hackathon detail page. `APPROVE` instantly creates the metric definition; `REJECT` accepts an optional reason
7. **End hackathon** — `END HACKATHON` sets status to `ENDED` (read-only)
8. **Live view** — `LIVE VIEW ↗` opens the public projection screen in a new tab

### Member flow

1. Register at `/login` → `/register` tab → pick handle, 4-digit PIN, neon color
2. Join a team — either:
   - Visit a direct link like `/join/ALPH` → preview team info → `[ JOIN TEAM ALPHA ]`
   - Or go to `/join`, type the code manually
3. **Team dashboard** (`/dashboard`) — team totals, 24h timeline, bar chart, leaderboard sorted by total score
4. **Personal tracking** (`/dashboard/track`) — your own stats + logging controls:
   - Counter buttons (`[ + RED BULL ]` / `[ - RED BULL ]`) for counter-type metrics
   - Number inputs for metrics like SLEEP
   - **Propose Metric** panel (right column) — suggest a new metric definition; shows your proposals with PENDING / APPROVED / REJECTED status
5. **Profile** — click your handle in the nav to change name, color, or PIN

### Registering a new organizer

Go to `/register-organizer` (linked from the bottom of `/login`). Requires the `ORGANIZER_SECRET` value. On success, redirects to `/organizer`.

---

## Live projection view

```
/live/[hackathonId]
```

- **No login required** — safe to display on a projector or shared screen
- Shows: hackathon name, live countdown to deadline, ranked team leaderboard with per-metric breakdowns and member scores
- Auto-refreshes every 10 seconds
- Footer shows last update time and hackathon status

The organizer can share this URL or click **LIVE VIEW ↗** from the hackathon detail page.

---

## Route map

```
/login                    Member + organizer login / register
/register-organizer       Organizer self-registration (requires ORGANIZER_SECRET)

/join                     Manual invite code entry
/join/[code]              Link-based team join with preview

/dashboard                Team leaderboard (members only)
/dashboard/track          Personal metric logging
/dashboard/profile        Edit name, color, PIN

/organizer                Hackathon list (organizer / superadmin only)
/organizer/[hackathonId]  Hackathon detail: teams, metrics, proposals

/live/[hackathonId]       Public projection screen (no auth)
```

## API

```
POST /api/auth/register             Register as MEMBER
POST /api/auth/register-organizer   Register as ORGANIZER (requires secret)
POST /api/auth/login                Login
POST /api/auth/logout               Clear session
GET  /api/auth/profile              Get current user
PUT  /api/auth/profile              Update name / color / PIN

GET  /api/metrics                   Personal metric totals + timeline + definitions
POST /api/metrics                   Log a metric entry

GET  /api/team                      Team leaderboard + timeline
POST /api/team/join                 Join a team by invite code

GET  /api/definitions               Metric definitions for current hackathon
POST /api/definitions               Create a new metric definition
PUT  /api/definitions               Edit a definition
DELETE /api/definitions             Delete a definition (and its data)

GET  /api/hackathon                 List hackathons
POST /api/hackathon                 Create hackathon (organizer+)
GET  /api/hackathon/active          Current ACTIVE hackathon
GET  /api/hackathon/[id]            Hackathon detail + teams + definitions
PUT  /api/hackathon/[id]            Update name / dates / status (organizer+)
POST /api/hackathon/[id]            Create a team within the hackathon (organizer+)

GET  /api/proposals                 List proposals (organizer: all; member: own)
POST /api/proposals                 Submit a metric proposal
PUT  /api/proposals/[id]            Approve or reject a proposal (organizer+)

GET  /api/live/[hackathonId]        Public team leaderboard data (no auth)
```
