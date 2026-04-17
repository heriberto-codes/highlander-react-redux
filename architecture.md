# Architecture

## Overview
- Highlander is a monolithic web application for coaches to manage teams, rosters, and softball/baseball-style player stats.
- Primary users are coaches logging into a dashboard, reviewing teams, viewing roster data, and entering stats.
- Main business purpose is team/roster management plus stat tracking, including newer season-aware views and game-based stat entry.

## System Boundaries
- Inside the system:
  - React client in `src/`
  - Express server in `server.js`
  - PostgreSQL schema managed through Knex migrations/seeds
  - Session-backed authentication and authorization checks
- Outside the system:
  - Browser runtime
  - Deployment platform / reverse proxy
  - PostgreSQL instance hosting
- External services and APIs:
  - No third-party business APIs are integrated in the repository.
- Third-party integrations:
  - PostgreSQL via `pg`
  - Session persistence via `connect-pg-simple`

## Architectural Principles
- Prefer simple route-level implementations over additional abstraction layers.
- Keep API changes additive where possible; recent work extends existing endpoints instead of creating parallel APIs.
- Preserve current payload shapes when adding new fields such as `derivedStats`, `availableSeasons`, and `activeSeason`.
- Prefer server-enforced ownership checks for team/player access.
- Avoid premature service-layer indirection; most business logic currently lives close to routes and utilities.

## Constraints and Non-Goals
- Technical constraints:
  - Express 4 + Bookshelf/Knex + React 17 + Redux architecture is the current stack.
  - Session auth depends on `CLIENT_ORIGIN`, `SECRET`, and `DATABASE_URL`.
  - API routes are mounted without an `/api` prefix.
- Product constraints:
  - Current stat analytics only support metrics derivable from the existing stat catalog.
  - Team season views are constrained by current schema and legacy stat rows.
- Explicit non-goals:
  - No microservice split.
  - No background job system.
  - No public API versioning strategy is implemented.
- Framework/tooling limits:
  - Client is built with `react-scripts`.
  - Bookshelf models expose basic relations; route handlers still own most orchestration.

## Runtime Components
- Express application in `server.js`
- React SPA in `src/`, served from `build/` in production
- PostgreSQL database
- Session store:
  - `MemoryStore` in test environments
  - `connect-pg-simple` in non-test environments

## Request Flow
1. Browser requests a page or API route.
2. Express applies `helmet`, `morgan`, session middleware, JSON parsing, static asset serving, and CORS.
3. For protected routes, `ensureAuthenticated` verifies `req.session.coachId`.
4. For state-changing routes, `requireTrustedOrigin` validates `Origin` or `Referer` against `CLIENT_ORIGIN`.
5. Route handlers in `api/routes/` validate request shape manually.
6. Route handlers use Bookshelf models and, in one case, a transaction for multi-row game/stat writes.
7. Responses are returned as JSON; non-API GETs fall back to `build/index.html`.
8. Unhandled server errors reach the final error middleware and return HTTP 500 JSON.

## Data Flow
React + Redux + Axios → Express routes → Bookshelf/Knex → PostgreSQL

Additional flows:
- React dev server → Express API → PostgreSQL during local development
- Express static file serving → Browser for `public/` and `build/` assets
- Team game entry write flow:
  - React form → `POST /teams/:id/games` → transaction creating `games` row and related `players_stat_catalogs` rows

## Data Layer
- Primary database:
  - PostgreSQL
- ORM/query layer:
  - Bookshelf models on top of Knex
- Migrations approach:
  - Schema changes live in `data/migrations/`
  - Seed data lives in `data/seeds/` and `data/prod_seeds/`
- Transactional boundaries:
  - `POST /teams/:id/games` uses a Bookshelf/Knex transaction to create one game and its stat rows together
  - Most other writes are single-model saves without explicit transactions

## Database Schema (High Level)
- Core entities:
  - `coaches`
  - `teams`
  - `players`
  - `stat_catalogs`
  - `games`
  - `players_stat_catalogs`
- Important relationships:
  - coaches ↔ teams via `coaches_teams`
  - players ↔ teams via `players_teams`
  - players ↔ stat catalogs via `players_stat_catalogs`
  - teams → games via `games.team_id`
  - game-based stat rows optionally link through `players_stat_catalogs.game_id`
- Ownership boundaries:
  - Coaches own access indirectly through associated teams
  - Team and player authorization is checked by walking team/coach relationships

## Client Architecture
- UI structure:
  - Route-level pages in `src/pages/`
  - Shared/presentational components in `src/components/`
- State management approach:
  - Central Redux store in `src/store.js`
  - Async action creators use `redux-thunk`
  - Forms use `redux-form`
- Rendering strategy:
  - Client-rendered SPA
  - Production build served by Express
- Routing approach:
  - `react-router-dom` routes are defined in `src/container/App.js`
- Client API URL contract:
  - client actions should not hardcode server origins such as `http://localhost:8080`
  - client actions should call API routes through relative URLs when the browser and API are served through the same origin
  - local development must either preserve same-origin serving or provide an equivalent proxy/path setup before pure relative URLs are adopted everywhere
  - route paths themselves stay unchanged, only client URL construction should change
  - credentialed requests must continue using Axios `withCredentials: true`

## Server Architecture
- Route/controller/service boundaries:
  - Route files act as both routing and controller layer
  - There is no separate service layer in the repository
- Business logic location:
  - Mostly in route handlers
  - Shared auth/filter/analytics logic in `api/utils/`
- Validation strategy:
  - Manual per-route field checks
  - Ownership checks via `api/utils/authorization.js`
  - Request origin checks via `api/middleware/requireTrustedOrigin.js`
- Error handling approach:
  - Route handlers usually call `next(err)`
  - Final middleware returns `{ error: 'Internal server error' }`

## API Structure
- API style:
  - JSON-over-HTTP REST-style routes
- Route organization:
  - `api/routes/playerRouter.js`
  - `api/routes/coachRouter.js`
  - `api/routes/teamRouter.js`
  - `api/routes/statRouter.js`
  - `api/routes/sessionRouter.js`
- Versioning strategy:
  - No explicit API versioning
- Response conventions:
  - JSON payloads for success cases
  - Plain string messages in many validation/auth failure cases
  - Additive response enrichment for derived stats and season metadata

## Authentication
- Identity/authentication mechanism:
  - Coach email/password login
- Session/token approach:
  - Session-based auth with `express-session`
  - Session data stored in Postgres outside tests
  - Login endpoint is `POST /sessions/login`
  - Auth bootstrap endpoint is `GET /sessions`
  - `GET /sessions` reads only `req.session.coachId`
  - `GET /sessions` is read-only and returns minimal coach identity data for client rehydration
  - `GET /sessions` returns `401` when no valid authenticated session exists
  - If `req.session.coachId` points to a missing coach, `GET /sessions` destroys the stale session before returning `401`
  - Logout endpoint is `DELETE /sessions`

## Authorization
- Roles/permissions:
  - Collaboration is team-scoped and additive on top of `coaches_teams`
  - Implemented roles:
    - `owner`
    - `assistant`
- Resource access rules:
  - Coaches can access teams/players associated to their coach account
  - `GET /coaches/:id` also requires the path id to match the authenticated coach id
  - Collaboration read rule:
    - any coach attached to a team may read collaborator data for that team
  - Collaboration mutate rule:
    - only `owner` may add collaborators, change collaborator role, or remove collaborators
  - Implemented privilege boundaries:
    - `assistant` cannot promote self
    - `assistant` cannot remove an `owner`
    - `owner` cannot remove the last `owner` without first assigning another `owner`
    - collaborator removal rules prevent removal of the last `owner`
  - Implemented ordinary write rule:
    - both `owner` and `assistant` may perform existing team/player/stat write operations guarded by team membership
- Protected operations:
  - Coach profile reads/updates
  - Coach notification reads/mutations are planned as coach-owned resources only
  - Team detail reads and writes
  - Player reads and writes
  - Logout
  - Collaboration-protected operations:
    - `GET /teams/:id/coaches` requires team membership
    - `POST /teams/:id/coaches` requires `owner`
    - `PUT /teams/:id/coaches/:coachId` requires `owner`
    - `DELETE /teams/:id/coaches/:coachId` requires `owner`

## Security Model
- Input validation:
  - Manual required-field and type checks in route handlers
  - Some query validation helpers in `api/utils/filterQuery.js`
  - Collaboration routes validate target coach id, role, duplicate association, and last-owner removal server-side
  - Planned notification routes should accept only explicit read/dismiss state transitions and must derive coach ownership from the authenticated session
- Secrets handling:
  - `DATABASE_URL`, `CLIENT_ORIGIN`, and `SECRET` come from environment variables
- Data protection considerations:
  - Cookies are `httpOnly`
  - `secure` is enabled in production
  - `sameSite` is set to `strict`
- File upload/storage constraints:
  - No file upload pipeline is implemented
- Abuse/rate-limit considerations:
  - Login endpoint has in-memory attempt limiting by `ip + email`
  - No generalized API rate limiting is present

## Background Tasks
- No jobs, workers, or schedulers are defined in the repository.
- All current work is request/response driven.
- No retry framework or dead-letter behavior exists.
- Planned notification/reminder contract must stay within this constraint:
  - v1 is in-app only
  - no email, SMS, push, or background delivery worker
  - reminder generation should happen in request flow from existing persisted data, not from cron

## Notifications And Reminders Contract
- Planned v1 scope:
  - in-app notifications only
  - primary surface is the dashboard
  - additive API enrichment on existing coach reads is preferred
- Planned reminder source:
  - existing `games.game_date`
  - upcoming-game reminders only in v1
- Planned notification ownership rules:
  - a coach may read and mutate only that coach's notifications
  - notification routes must keep the existing `GET /coaches/:id` path-id ownership rule
  - mutating notification routes must preserve `requireTrustedOrigin`
- Planned notification states:
  - unread
  - read
  - dismissed
- Planned contract limits:
  - no delivery preferences in v1
  - no cross-channel delivery logs in v1
  - reminder generation must be idempotent for the same coach/team/game/window

## Performance Considerations
- Caching strategy:
  - No explicit cache layer is implemented
- Pagination/search expectations:
  - Search/filtering exists on coach/team read endpoints through query params
  - No pagination exists on list endpoints
- Query efficiency concerns:
  - Nested `withRelated` fetches can produce heavier payloads
  - Some authorization checks require loading related teams/coaches
  - Stat catalog validation for game entry performs one fetch per distinct stat id
- Payload size concerns:
  - Dashboard and team detail endpoints can return nested teams, players, stats, derived stats, and season metadata

## Observability and Operations
- Logging:
  - HTTP logging via `morgan('common')`
  - Server errors are printed with `console.error`
- Monitoring:
  - Not implemented in the repository
- Alerting:
  - Not implemented in the repository
- Health checks:
  - No dedicated health-check endpoint is defined

## Build and Run
- Local development workflow:
  - `npm install`
  - `npm run client` for React dev server
  - `npm start` for Express server
  - `npm run migrate`
  - `npm run seed`
- Build steps:
  - `npm run build`
- Test commands:
  - `npm test`
  - `npm run lint`
- Run commands:
  - `npm start`
  - `npm run client`

## Environment Configuration
Required variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `CLIENT_ORIGIN`: allowed browser origin for CORS and trusted-origin enforcement
- `SECRET`: session secret
- `PORT`: Express listen port

Local vs production differences:
- Production cookies are marked `secure`
- Tests use in-memory session storage instead of Postgres-backed sessions
- Production build is served from `build/`

## Deployment
- Hosting/platform:
  - The repo includes a `Procfile`, suggesting process-based hosting such as Heroku-style deployment
- CI/CD flow:
  - Not defined in the repository
- Rollout expectations:
  - Build client, provide env vars, run `node server.js`
- Rollback approach:
  - Not documented in the repository

## Key Dependencies

### Frontend
- `react`
- `react-dom`
- `react-router-dom`
- `redux`
- `react-redux`
- `redux-thunk`
- `redux-form`
- `redux-logger`
- `axios`
- `bulma`
- `react-scripts`

### Backend
- `express`
- `body-parser`
- `cors`
- `helmet`
- `morgan`
- `express-session`
- `connect-pg-simple`
- `bcrypt`

### Database
- `pg`
- `knex`
- `bookshelf`

### Infrastructure
- `dotenv`
- `nodemon`
- `eslint`
- `supertest`
- `mocha`
- `chai`

## Known Risks
- `src/pages/TeamDetails.js` expects `this.props.match.params`, but routing is configured with React Router v6 elements; this may indicate an incomplete migration.
- Client actions hard-code `http://localhost:8080`, which is brittle outside local development.
- `highlander-react-redux-db.sql` appears older than current migrations and should not be treated as the current schema source of truth.
- Seed passwords are plain text even though runtime authentication uses bcrypt.
- Validation is route-local and duplicated rather than centralized.
- Login throttling is per-process memory only.
- Season-scoped stat attribution still depends on `game_date` and legacy rows may not have `game_id`.
- Team details collaborator add UI still has a known client-side validation gap: empty coach id input is coerced to `0`; server-side validation still rejects it.

## Extension Points
- Expand derived analytics in `api/utils/playerAnalytics.js`
- Add richer search/filtering to existing team/coach payloads
- Add additional game lifecycle operations beyond create-only game entry
- Introduce a service layer if route logic grows further
- Replace hard-coded client API endpoints with environment-aware configuration

## Open Questions
- Is the React Router v6 migration intentionally partial, or is `TeamDetails` currently broken in runtime?
- Should login/register/session flows be expanded beyond coach accounts?
- Should stat writes eventually require all rows to attach to `games` and deprecate legacy direct stat endpoints?
- What deployment environment is the canonical target beyond the presence of `Procfile`?
- Is the older SQL dump still needed, or should migrations be treated as the only schema source of truth?
