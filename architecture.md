# Architecture

## Overview
Highlander is a monolithic Node/Express application with a React/Redux client. The server exposes a REST API and serves the built client from `build/` for production. The client can also run via the React dev server for local development.

## Runtime Components
- **Server**: Express app in `server.js`, API routes in `api/routes/`
- **Client**: React app in `src/`, bundled by `react-scripts`
- **Database**: PostgreSQL accessed via Knex + Bookshelf

## Key Dependencies
- **Server Framework**: `express`, `body-parser`, `cors`, `helmet`, `morgan`
- **Authentication/Session**: `express-session`, `connect-pg-simple`, `bcrypt`
- **Database/ORM**: `pg`, `knex`, `bookshelf`
- **Client Framework**: `react`, `react-dom`, `react-scripts`
- **State Management**: `redux`, `react-redux`, `redux-thunk`, `redux-form`, `redux-logger`
- **Routing and HTTP**: `react-router-dom`, `axios`

## Request Flow
1. Browser requests pages or API.
2. Express serves static assets from `public/` and `build/`.
3. API routes handle `/players`, `/teams`, `/coaches`, `/stats`, `/sessions` and perform DB operations.
4. Client uses Axios to call API endpoints and updates Redux store.

## Data Flow
React client → Express API → PostgreSQL

Additional flows:
- React dev server → Express API → PostgreSQL (local development)
- Express → static assets (`public/`, `build/`) → Browser

## Data Layer
- **Knex** handles migrations and query building.
- **Bookshelf** is the ORM on top of Knex.
- Migrations: `data/migrations/`
- Seeds: `data/seeds/`

## Client Architecture
- **State**: Redux store in `src/store.js`
- **Reducers**: `src/reducers/`
- **Actions**: `src/actions/`
- **Pages**: `src/pages/`
- **Shared Components**: `src/components/`

## Server Architecture
- **Entry**: `server.js`
- **Routes**: `api/routes/*Router.js`
- **Config**: `config.js`, `knexfile.js`

## API Structure
Base paths are mounted in `server.js` (no `/api` prefix):
- `POST /sessions/login` (login)
- `DELETE /sessions` (logout)
- `GET /coaches` (list coaches, requires session)
- `GET /coaches/:id` (coach by id; includes additive player analytics and season metadata)
- `POST /coaches` (create coach, auth required)
- `PUT /coaches/:id` (update coach, auth required)
- `GET /teams` (list teams)
- `GET /teams/:id` (team by id, includes coach, players, additive player analytics, and season metadata)
- `POST /teams` (create team, auth required, requires `season`)
- `PUT /teams/:id` (update team, auth required, requires `season`)
- `POST /teams/:id/player` (add player to team, auth required)
- `POST /teams/:id/games` (auth required; create-only game-based stat entry for one team)
- `GET /players` (list players)
- `GET /players/:id` (player by id)
- `GET /players/:id/stats` (player stats)
- `POST /players` (create player, auth required)
- `PUT /players/:id` (update player, auth required)
- `POST /players/:player_id/stats/:stat_catalog_id` (legacy direct stat write; auth required)
- `PUT /players/:player_id/stats/:stat_catalog_id` (update stat, auth required)
- `DELETE /players/:id` (delete player, auth required)
- `GET /stats` (list stat catalog)
- `GET /stats/:id` (stat catalog by id)

### Player Analytics Contract
- `GET /coaches/:id` remains the dashboard data source and includes `player.derivedStats`
- `GET /teams/:id` exposes the same additive `player.derivedStats` shape
- both endpoints support season-aware stat shaping:
  - `GET /coaches/:id?season=<year>`
  - `GET /teams/:id?season=<year>`
- dashboard/team payloads may include:
  - `availableSeasons`
  - `activeSeason`
- season-scoped stat filtering uses `players_stat_catalogs.game_date` year
- additive `derivedStats` fields:
  - `battingAverage`
  - `homeRunRate`
  - `era`
  - `strikeoutsPerInning`
- values are numeric or `null` when missing data or zero denominators prevent valid calculation
- excluded from v1 due to current stat catalog limits:
  - `onBasePercentage`
  - `sluggingPercentage`
  - `ops`
  - walks-based metrics
  - doubles/triples-based metrics
  - team leaderboards or rankings

### Team Season Views Contract
- `teams.season` is the persisted season/year source of truth for team membership and team browsing
- `GET /coaches/:id` may return season-filtered teams plus `availableSeasons` and `activeSeason`
- `GET /teams/:id` may return team `season` plus `availableSeasons` and `activeSeason`
- current season-family heuristic for team details uses same `team.name` within the coach's teams
- known limitation:
  - player stats are dated, but not linked to `team_id`
  - if a player changes teams within the same season, season-filtered stats cannot be perfectly attributed to one team

### Search And Filtering Contract
- v1 extends existing read endpoints; it does not add new endpoints
- shipped filter surface:
  - `GET /coaches/:id?season=<year>&teamSearch=<text>&playerSearch=<text>&position=<text>`
  - `GET /teams/:id?season=<year>&playerSearch=<text>&position=<text>`
- supported filter semantics:
  - `season` continues to select the active season view
  - `teamSearch` narrows dashboard teams by case-insensitive text match
  - `playerSearch` narrows returned players by case-insensitive text match
  - `position` narrows returned players using current free-text `players.position`
- normalization rules:
  - trim leading/trailing whitespace for text filters
  - omit filtering for missing or empty values
  - preserve existing payload shape and existing auth behavior
- validation rules:
  - invalid filter format may return `400`
  - valid filters with no matches return `200` with empty result collections
- response invariants:
  - keep top-level coach/team fields unchanged
  - keep additive `derivedStats` contract unchanged
  - keep `availableSeasons` and `activeSeason` contract unchanged
  - only narrow the returned teams/players/stats for the current payload
- implementation note:
  - prefer additive query params and small route/controller changes over new endpoints, new frameworks, or schema work
- rollout note:
  - no database schema change was required for v1
  - filtering is applied in existing route/controller response shaping

### Game-based Stat Entry Contract
- v1 adds `games` as a first-class persisted record
- current `games` fields:
  - `id`
  - `team_id`
  - `opponent`
  - `game_date`
- v1 write path is create-only and team-scoped:
  - `POST /teams/:id/games`
- request body:
  - `opponent`
  - `game_date`
  - `playerStats: [{ playerId, stats: [{ statCatalogId, howMany }] }]`
- current server behavior:
  - validate authenticated access
  - validate target team exists
  - validate each submitted player belongs to that team
  - validate each submitted `statCatalogId` exists
  - create one game row
  - create one stat row per non-zero submitted stat
- current persistence rules:
  - each created stat row links to the created game via `game_id`
  - each created stat row also stores `game_date`
  - legacy stat rows may remain without `game_id`
- v1 entry surface is the team details page for an existing roster
- existing direct stat routes remain supported for backward compatibility, but are not the primary v1 entry path
- current known limitations:
  - route protection exists, but team ownership is not yet verified on `POST /teams/:id/games`
  - team details page still depends on legacy routing assumptions outside this contract

## Authentication
- Session-based auth via `express-session`, stored in Postgres with `connect-pg-simple`.
- Login: `POST /sessions/login` creates a session; logout: `DELETE /sessions` destroys it.
- Protected routes use `ensureAuthenticated` middleware.

## Background Tasks
- No dedicated background jobs or workers are defined.
- All work is request/response driven.

## Build and Run
- **Install**: `npm install`
- **Build**: `npm run build` (creates `build/`)
- **Server**: `npm start` (Express + static client)
- **Client Dev**: `npm run client` (hot reload)
- **DB Migrate**: `npm run migrate`
- **DB Seed**: `npm run seed`

## Environment Configuration
Required variables (see `.env.example`):
- `DATABASE_URL`
- `CLIENT_ORIGIN`
- `SECRET`
- `PORT`

## Database Schema (High Level)
- `coaches`
- `teams`
  - includes persisted `season`
- `games`
  - stores `team_id`, `opponent`, `game_date`
- `players`
- `stat_catalogs`
- `players_stat_catalogs`
  - may include nullable `game_id`
- `players_teams`
- `coaches_teams`

## Deployment
- Build client: `npm run build`
- Run server with env vars set
- Express serves `build/` in production
