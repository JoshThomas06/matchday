# Goal Description

Stabilize and productionize the Antigravity MatchDay platform by completing the transition to live APIs, fixing broken data flows, and implementing a persistent backend for predictions, while preserving the existing futuristic aesthetic. 

Based on my audit, several items from your checklist have already been partially or fully addressed:
- The **Football Module** is correctly hitting the RapidAPI and rendering actual fixtures.
- The **API Architecture** (`/api/match`) already implements a solid caching layer (60s TTL) which deduplicates requests and protects against rate limits (already active).

The focus of this plan will be fixing the remaining critical issues: removing fake cricket analytics, building a real predictions backend, and handling unfinished/dead UI sections.

## User Review Required

> [!IMPORTANT]
> The Predictions module needs a real backend. I propose using a local SQLite database (`better-sqlite3`) to handle persistent votes, users, and polls without requiring external database setups (like Postgres or Redis). Does this sound good, or would you prefer a simple JSON-based server-side file persistence for maximum simplicity?

> [!WARNING]
> Live Cricket Analytics (Boundary Pulse, Run Progression) in `app/dashboard/page.tsx` are currently using fake mathematical formulas derived from the overall score. Since the free CricAPI does not provide detailed ball-by-ball data or boundary stats, I propose we **remove** these specific widgets entirely to comply with your "remove fake systems" rule, or replace them with simple data we actually have. Do you approve removing them?

## Proposed Changes

---

### 1. Cricket Dashboard & Analytics

#### [MODIFY] [app/dashboard/page.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/app/dashboard/page.tsx)
- Remove the fake `Run Progression` widget (which simulates run rate using a hardcoded array).
- Remove the fake `Boundary Pulse` widget (which mathematically derives boundaries via `score * 0.18`).
- Clean up any dead references.

#### [MODIFY] [app/stats/page.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/app/stats/page.tsx)
- The analytics page currently assumes Football stats (Possession, Shots on Goal).
- Add specific handling for `sport=cricket` to display a graceful fallback or relevant cricket data instead of trying to render empty Football tables.

---

### 2. Real Predictions Engine

#### [NEW] [lib/db.ts](file:///c:/Users/joshv/antigravity-matchday-v2/lib/db.ts)
- Implement a SQLite database connection (via `better-sqlite3` or `sqlite3`) to store Polls, Votes, and User points.

#### [MODIFY] [app/api/polls/route.ts](file:///c:/Users/joshv/antigravity-matchday-v2/app/api/polls/route.ts)
- Replace the in-memory `Map` with actual SQLite queries to persist live polls and user votes permanently.

#### [MODIFY] [app/predictions/page.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/app/predictions/page.tsx)
- Connect fully to the new SQLite-backed API and remove the `localStorage` fallback logic for prediction history.

---

### 3. Sidebar Navigation & Placeholder Sections

You requested to either fully implement unfinished tabs or temporarily hide them. Given the scope, the safest approach to maintain a production-grade feel is to implement premium "Coming Soon" states for incomplete modules.

#### [MODIFY] [app/quiz/page.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/app/quiz/page.tsx)
- Replace the fake mock content with a visually consistent "Coming Soon" or "Offline" state.

#### [MODIFY] [app/moments/page.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/app/moments/page.tsx)
- Replace with a "Coming Soon" state.

#### [MODIFY] [app/watch/page.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/app/watch/page.tsx)
- Ensure dead partner links are removed or the whole page is set to a disabled/coming soon state.

#### [MODIFY] [components/layout/SideNav.tsx](file:///c:/Users/joshv/antigravity-matchday-v2/components/layout/SideNav.tsx)
- Audit links and visually dim or add a small "SOON" badge to inactive routes.

## Verification Plan

### Manual Verification
1. Open the application and navigate to the Cricket dashboard. Verify that no fake analytics widgets are rendered.
2. Navigate to the Predictions tab. Cast a vote, restart the development server, and verify the vote still exists (testing SQLite persistence).
3. Click through the Sidebar links (Quiz, Moments, Stats) to verify they don't show broken data or fake mockups, but instead show a polished "Coming Soon" UI.
