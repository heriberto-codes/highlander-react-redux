# Repository Analysis

## Project Architecture

- Monolithic web app: Express server in `server.js`, React SPA in `src/`, PostgreSQL behind Knex + Bookshelf.
- Express serves both JSON routes and the built client from `build/`.
- Auth is cookie/session based with `express-session`; tests use in-memory sessions, non-test runtime uses `connect-pg-simple`.
- API style is additive REST without `/api` prefix or versioning.
- Most business logic still lives in route files plus a few shared utility modules.

## Key Modules

- `server.js`: middleware stack, session config, route mounting, SPA fallback, error handler.
- `api/routes/`
  - `sessionRouter.js`: login, logout, session bootstrap
  - `coachRouter.js`: dashboard/profile reads, filtering, notifications enrichment
  - `teamRouter.js`: team detail, collaborator CRUD, team writes, game entry
  - `playerRouter.js`: player CRUD and stat writes
  - `statRouter.js`: stat catalog reads
- `api/utils/`
  - `authorization.js`: ownership + collaboration checks
  - `playerAnalytics.js`: derived stats and season scoping
  - `notifications.js`: reminder shaping and idempotency helpers
  - `filterQuery.js`: query validation helpers
- `src/store.js`: Redux store with `loginReducer`, `coachReducer`, `teamReducer`, `redux-form`
- `src/actions/`: Axios-backed async actions for login/session bootstrap, dashboard profile, team detail, collaborators, game entry
- `src/pages/`: route-level UI (`Home`, `Login`, `Register`, `Dashboard`, `TeamDetails`)
- `src/components/`: mostly presentational UI for navigation, lists, forms, and team details

## Data Models

- `Coach`
  - auth identity
  - many-to-many with `Team` through `coaches_teams`
  - has many `Notification`
- `Team`
  - core team record plus `season`
  - many-to-many with `Coach` and `Player`
  - has many `Game`
  - has many `Notification`
- `Player`
  - roster identity fields plus `position`
  - many-to-many with `Team`
  - many-to-many with `Stat_Catalog` through `players_stat_catalogs`
- `Game`
  - first-class team game record (`team_id`, `opponent`, `game_date`)
  - has many `Notification`
- `PlayerStat`
  - stat row in `players_stat_catalogs`
  - optionally linked to `game_id`
- `Stat_Catalog`
  - stat definitions
- `Notification`
  - coach-owned reminder/notification rows in `coach_notifications`
  - optional `team_id` / `game_id`
  - uses `idempotency_key`

## API Structure

- Base paths:
  - `/sessions`
  - `/coaches`
  - `/teams`
  - `/players`
  - `/stats`
- Auth/session:
  - `POST /sessions/login`
  - `GET /sessions`
  - `DELETE /sessions`
- Coach/dashboard:
  - `GET /coaches/:id`
  - includes season-aware team/player payload, filters, derived stats, notifications
- Team/collaboration:
  - `GET /teams/:id`
  - `GET /teams/:id/coaches`
  - `POST /teams/:id/coaches`
  - `PUT /teams/:id/coaches/:coachId`
  - `DELETE /teams/:id/coaches/:coachId`
  - `POST /teams/:id/player`
  - `POST /teams/:id/games`
- Player:
  - list/detail/update/delete plus legacy stat entry routes

## Important Dependencies

- Server/runtime:
  - `express`, `body-parser`, `cors`, `helmet`, `morgan`
- Auth/session:
  - `express-session`, `connect-pg-simple`, `bcrypt`
- Data:
  - `pg`, `knex`, `bookshelf`, `bluebird`
- Client:
  - `react` 17, `react-dom`, `react-router-dom` 6, `axios`
- State/forms:
  - `redux`, `react-redux`, `redux-thunk`, `redux-form`, `redux-logger`
- Testing:
  - `react-scripts` Jest runner, `supertest`

## Risk Areas

- Hardcoded client API origins in action files still couple the client to `http://localhost:8080`.
- Auth flow now spans route bootstrap, thunk, reducer, App mount, and Login redirect timing; regressions can hide in transitions.
- Login redirect currently uses deferred navigation timing, which is behaviorally covered but still noisy in tests.
- Route validation is hand-written and inconsistent; no shared schema layer.
- In-memory login rate limiting does not scale across processes/instances.
- Some repo docs and legacy SQL artifacts can drift from migration-backed schema truth.
- Older class-component patterns coexist with React Router v6 and connected wrappers, increasing integration fragility.

## Assumptions / Unknowns

- Assumed `architecture.md` is the current source of truth where it matches code.
- Assumed `build/` is generated output, not source of truth.
- Assumed no hidden service layer exists outside route/util files.
- Unknown whether route-level React Router v6 integration has remaining untested edge cases outside the auth/session bootstrap flow.
- Unknown whether legacy files like `highlander-react-redux-db.sql` are still used operationally or only as historical reference.
