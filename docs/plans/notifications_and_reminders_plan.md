# Plan: Notifications and reminders

Backlog item: `- [ ] Notifications and reminders`

Feature slug: `notifications_and_reminders`

## 1. Architecture overview
Monolith. Express API in `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`. React 17 SPA in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src`. PostgreSQL via Knex + Bookshelf. No worker, cron, mailer, or push service exists. Safest v1: in-app notifications only, stored in Postgres, surfaced in dashboard/team reads, reminder generation done in request flow from existing `games.game_date`.

## 2. Detected technology stack
- Backend: Node.js, Express, body-parser, cors, helmet, morgan
- Auth: express-session, connect-pg-simple, bcrypt
- Data: PostgreSQL, Knex, Bookshelf
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk, redux-form
- HTTP/UI: axios, Bulma
- Tests: Jest via `react-scripts`, `supertest`

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_create_coach_notifications>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_ucoach_associations.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Game.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/<new_Notification>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/authorization.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/<new_notifications>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/<new_NotificationsList>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/<new_NotificationsList>.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`

## 4. Database changes
- Add one additive table for in-app notifications, likely `coach_notifications`.
- Minimum safe columns:
  - `id`
  - `coach_id` not null FK
  - `team_id` nullable FK
  - `game_id` nullable FK
  - `kind` string not null
  - `message` string/text not null
  - `scheduled_for` datetime nullable
  - `read_at` datetime nullable
  - `dismissed_at` datetime nullable
  - `created_at` datetime not null
- Keep v1 simple. No delivery log table. No preferences table unless product requires per-coach opt-out immediately.

Migration risks:
- Backfill likely not required if table is additive.
- If uniqueness is needed for generated reminders, add deterministic unique key carefully; duplicate generation is the main risk.
- FK deletes must be decided up front; safest is nullable references plus app-level filtering, not cascades that silently erase audit history.

## 5. API endpoints
- Extend existing dashboard read:
  - `GET /coaches/:id`
    - additive `notifications`
    - additive `unreadNotificationCount`
- Add notification mutation endpoints under coach resource:
  - `GET /coaches/:id/notifications`
  - `PUT /coaches/:id/notifications/:notificationId`
- Optional `PUT` request body:
  - `read: true`
  - `dismissed: true`

Contract:
- auth required on all notification routes
- coach may read/mutate only own notifications
- response shape additive
- no email/SMS/push delivery in v1
- notification generation should be idempotent for the same coach/team/game/reminder window

## 6. Frontend components
- Primary surface: dashboard
- Likely controls:
  - summary badge / unread count in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
  - notification list in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/<new_NotificationsList>.js`
- State/request flow:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`

## 7. Safest implementation approach
- Ship v1 as in-app only.
- Use existing `games.game_date` as first reminder source.
- Generate due reminders inside dashboard/notification read flow, not via scheduler.
- Persist notifications so read/dismiss state survives reloads.
- Keep dashboard payload additive; avoid replacing existing team/player/stat flows.
- Defer email/push/reminder preferences until infrastructure exists.

Why safest:
- aligns with current request/response architecture
- no new framework
- no background worker
- smallest auth surface
- uses existing team/game ownership model

## 8. Risks and edge cases
- No scheduler exists; reminders generated on read can appear late if coach does not open app.
- Duplicate reminder creation if generation is not idempotent.
- Upcoming-game reminders need timezone policy; current repo stores `game_date` but not explicit user timezone preference.
- Team collaborators likely all see same team reminders; confirm owner vs assistant visibility.
- Dismissed reminder behavior unclear for regenerated reminders.
- Old games with missing stat rows may be tempting reminder targets, but detection is more complex than upcoming-game reminders.
- Dashboard payload already large; additive notification list should be bounded.

## 9. Security concerns
- Enforce authenticated coach id match on notification reads/mutations.
- Never trust client-submitted `coach_id`; derive from session/path validation.
- Bound list size; avoid exposing other coaches' team data through notification payload text.
- Validate notification mutation body strictly; only allow read/dismiss transitions.
- Preserve `requireTrustedOrigin` on mutating notification routes.

## 10. Testing strategy
- Route integration:
  - own notifications read succeeds
  - other coach access rejected
  - mark read succeeds
  - dismiss succeeds
  - invalid notification id rejected
  - generation is idempotent for repeated reads
- Action tests:
  - request URLs
  - mutation payloads
- Reducer tests:
  - notification collection
  - unread count
  - mark-read / dismiss success and error state
- Component tests:
  - unread badge render
  - empty list state
  - read/dismiss action wiring
- Regression:
  - `GET /coaches/:id` still returns current dashboard fields when notifications absent

## 11. Step-by-step implementation plan

Step 1: Define notification contract
Goal: lock v1 scope and avoid inventing delivery infrastructure
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
Changes:
- document v1 as in-app only
- define allowed notification states and ownership rules
- define reminder source as existing game schedule only
Done when:
- route/schema work can proceed without ambiguity on channel, auth, or payload shape

Step 2: Add notification persistence
Goal: store notifications and read/dismiss state
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_create_coach_notifications>.js`
Changes:
- create additive `coach_notifications` table
- add indexes on `coach_id`, `scheduled_for`, and any idempotency key columns
Done when:
- schema can persist notifications without changing existing tables

Step 3: Expose notification model relations
Goal: make notifications reachable through current Bookshelf patterns
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/<new_Notification>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Game.js`
Changes:
- add notification model
- add coach/team/game relations only where needed
Done when:
- routes can fetch notifications without raw SQL-only access paths

Step 4: Add server helper for reminder generation
Goal: centralize idempotent reminder creation from existing game data
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/<new_notifications>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/authorization.js`
Changes:
- add helper to compute due upcoming-game reminders for one coach
- add helper to normalize notification payloads
- add helper to enforce coach ownership on notification rows
Done when:
- routes can generate/read notifications through one shared code path

Step 5: Extend dashboard read with notifications
Goal: surface notifications without forcing a new initial client flow
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
Changes:
- generate due reminders during `GET /coaches/:id`
- include bounded `notifications` and `unreadNotificationCount`
- preserve existing dashboard shape
Done when:
- dashboard API returns additive notification data for authorized coach

Step 6: Add notification mutation endpoints
Goal: let coach mark notifications read or dismissed
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
Changes:
- add `GET /coaches/:id/notifications`
- add `PUT /coaches/:id/notifications/:notificationId`
- validate allowed state transitions only
Done when:
- coach can fetch full notification list and update own notification state safely

Step 7: Add client actions for notification flows
Goal: wire dashboard to notification APIs
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
Changes:
- add fetch notifications action if separate endpoint used
- add mark-read and dismiss actions
- keep existing profile request additive
Done when:
- client can request and mutate notifications through Redux thunks

Step 8: Add Redux notification state
Goal: track notifications and mutation status predictably
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
Changes:
- add notifications collection
- add unread count
- add request/success/error state for mark-read and dismiss flows
Done when:
- dashboard can render notification state and mutation feedback from reducer only

Step 9: Add dashboard notification UI
Goal: show reminders in existing coach context
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/<new_NotificationsList>.js`
Changes:
- render unread badge/summary
- render notification list with read/dismiss actions
- keep existing dashboard filters and season flow intact
Done when:
- authenticated coach can view and clear in-app notifications from dashboard

Step 10: Add backend notification tests
Goal: lock auth and idempotent generation rules
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
Changes:
- add route tests for read/mutate permissions and repeated read generation behavior
Done when:
- backend tests cover own-vs-other coach access and duplicate reminder prevention

Step 11: Add client notification tests
Goal: lock request wiring and dashboard UI behavior
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/<new_NotificationsList>.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js`
Changes:
- add action, reducer, and component tests for notification flows
Done when:
- client tests cover list render, unread count, mark-read, dismiss, and empty state

Step 12: Update docs and rollout notes
Goal: keep source-of-truth docs aligned with shipped behavior
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/<new_notifications_and_reminders>.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md`
Changes:
- document in-app notification scope
- document no background delivery infra in v1
- mark backlog item complete after implementation
Done when:
- docs describe actual shipped contract and rollout caveats

## 12. Detected test framework and current test file conventions
- Jest via `react-scripts`
- API/integration tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- action/reducer/component/page tests as colocated `*.test.js` in `src/`
- `supertest` used for API route checks

## 13. If no test convention exists, recommend one standard convention for this repo
Existing convention exists. Reuse it. Do not introduce a second test structure.

## Assumptions
- v1 means in-app notifications only.
- v1 reminder source is upcoming games from existing `games.game_date`.
- dashboard is the primary notification surface.
- notification list should be bounded, newest-first, not unbounded payload growth.

## Unresolved questions that must be answered before implementation
- Is v1 strictly in-app, or must email/SMS/push ship now?
- Which reminder types are required in v1:
  - upcoming game
  - overdue stat entry
  - team invitation/collaboration event
- What reminder lead time is expected:
  - same day
  - 24 hours
  - configurable
- Should assistants receive the same team game reminders as owners?
- Does dismiss mean permanent, or can the same reminder regenerate later?
- Should old notifications auto-expire or be retained indefinitely?
