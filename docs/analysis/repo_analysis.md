# Repository Analysis

## Project Architecture

- Highlander is a monolithic React + Express application for coaches to manage teams, rosters, collaboration, games, notifications, and softball/baseball-style stats.
- The React SPA lives in `src/`; Express lives in `server.js`; PostgreSQL is accessed through Knex + Bookshelf.
- Express serves API routes under `/api/v1` and serves the built client from `build/`, with `public/` used for static assets.
- Authentication is session-backed with `express-session`; tests use `MemoryStore`, while non-test runtime uses `connect-pg-simple` and PostgreSQL.
- Client state is Redux-based with `redux-thunk`; route-level components use React Router v6.

## Key Modules & Responsibilities

- `server.js`: middleware stack, session store selection, `/api/v1` route mounting, static serving, React Router fallback, final API error middleware.
- `config.js`: required environment variables: `DATABASE_URL`, `CLIENT_ORIGIN`, `SECRET`.
- `knexfile.js`: development/production PostgreSQL config, migration directory, seed directory.
- `api/routes/`: thin Express routers for sessions, coaches, teams, players, and stat catalogs.
- `api/handlers/`: request orchestration and domain behavior for sessions, coaches, teams, and players.
- `api/models/`: Bookshelf models for `Coach`, `Team`, `Player`, `Game`, `Notification`, `PlayerStat`, and `Stat_Catalog`.
- `api/middleware/`: auth/session and trusted-origin checks.
- `api/utils/`: authorization, filtering/query validation, error helpers, notifications, and derived player analytics.
- `src/container/App.js`: route definitions and session bootstrap dispatch on app mount.
- `src/actions/`: Axios-backed thunks using relative `/api/v1/...` URLs and `withCredentials`.
- `src/reducers/`: Redux state transitions for login/session, coach dashboard, and team detail flows.
- `src/pages/` and `src/components/`: route-level views and shared UI components.

## Data Models

- `coaches`: login identity and profile fields; passwords are validated with bcrypt at runtime.
- `teams`: team records with season support.
- `players`: roster identities and positions.
- `stat_catalogs`: stat definition records.
- `players_stat_catalogs`: player stat rows, with optional `game_id`.
- `games`: team game records.
- `coach_notifications`: coach-owned notifications/reminders with optional team/game links and idempotency keys.
- `coaches_teams`: coach/team collaboration join table with `role`.
- `players_teams`: player/team roster join table.

Important relationships:

- Coaches belong to many teams through `coaches_teams`.
- Teams belong to many players through `players_teams`.
- Players belong to many stat catalogs through `players_stat_catalogs`.
- Teams have many games and notifications.
- Coaches have many notifications.

## API Structure

- Public API prefix is `/api/v1`.
- Mounted groups:
  - `/api/v1/sessions`
  - `/api/v1/coaches`
  - `/api/v1/teams`
  - `/api/v1/players`
  - `/api/v1/stats`
- Session endpoints:
  - `POST /api/v1/sessions/login`
  - `GET /api/v1/sessions`
  - `DELETE /api/v1/sessions`
- Coach/dashboard endpoints:
  - `GET /api/v1/coaches`
  - `GET /api/v1/coaches/:id`
  - `POST /api/v1/coaches`
  - `PUT /api/v1/coaches/:id`
- Team endpoints include detail reads, team writes, player creation, game entry, and collaborator CRUD.
- Most mutating routes require both `ensureAuthenticated` and `requireTrustedOrigin`.
- Server authorization is the real boundary; `ProtectedRoute` only protects client UX.

## Testing Patterns

- Tests are Jest tests run through `react-scripts test --env=jsdom`.
- API tests use `supertest`, mainly in `src/server.test.js`.
- Unit tests live alongside app source under `src/` and use `*.test.js` naming.
- Existing test coverage includes:
  - API behavior and error handling
  - middleware/auth/origin behavior
  - model relationships
  - utility modules such as filters, notifications, analytics, and authorization
  - Redux actions/reducers/store
  - route-level pages and shared components
- Test environments set `DATABASE_URL`, `CLIENT_ORIGIN`, and `SECRET` in test files where needed and use in-memory session storage through the server test branch.

## Dependencies & Integrations

- Server: `express`, `body-parser`, `cors`, `helmet`, `morgan`.
- Auth/session: `express-session`, `connect-pg-simple`, `bcrypt`.
- Data: `pg`, `knex`, `bookshelf`, `bluebird`.
- Client: React 17, React Router 6, Axios, Bulma, Radium.
- State/forms: Redux, React Redux, Redux Thunk, Redux Form, Redux Logger.
- Tooling: `react-scripts`, ESLint, Knex CLI, Supertest.
- No third-party business APIs are integrated.

## Risk Areas & Complexity

- Local dev auth/register flow is currently fragile: the register UI is not wired to submit, `POST /api/v1/coaches` is authenticated, dev seed passwords are plain text while login uses bcrypt, and the `connect-pg-simple` session table is not represented in app migrations.
- Session behavior depends on a PostgreSQL session table outside test mode; missing local setup causes runtime auth failures.
- `CLIENT_ORIGIN` must match browser origin for trusted mutating requests.
- Route validation is mostly manual and can drift across handlers.
- Dashboard/team payload shaping combines authorization, season filtering, pagination, derived stats, and notification enrichment, making regressions easy without focused tests.
- Client routing uses React Router v6 while some legacy component/form patterns remain.
- `build/` is generated output; source-of-truth client changes should happen in `src/`.
- `highlander-react-redux-db.sql` appears to be reference/historical data and should not be treated as primary schema truth over migrations.

## Assumptions / Unknowns

- `architecture.md` is treated as the source of truth where it matches current code.
- Local development is expected to run against PostgreSQL at `DATABASE_URL`, not an embedded database.
- The production deployment path is documented but not validated in this analysis.
- It is unknown whether the reference SQL file is still used operationally outside the migration/seed workflow.
