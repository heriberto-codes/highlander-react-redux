# Repository Analysis

## Project Architecture

- Monolithic app: Express server in `server.js` and React/Redux client in `src/`.
- Express serves REST endpoints and also serves static assets from `public/` and the built client from `build/`.
- PostgreSQL is the data store; Knex manages migrations/seeds and Bookshelf defines models/relations.
- Auth is session-based via `express-session`; production-like runtime uses `connect-pg-simple`, tests use in-memory session storage.

## Key Modules

- `server.js`: app bootstrap, middleware, session setup, route mounting, SPA fallback.
- `api/routes/`: route handlers for `coaches`, `teams`, `players`, `stats`, `sessions`.
- `api/models/`: Bookshelf models for `Coach`, `Team`, `Player`, `Stat_Catalog`, `PlayerStat`, `Game`.
- `api/utils/playerAnalytics.js`: additive derived stats and season-scoped stat filtering.
- `api/utils/authorization.js`: ownership checks for coach/team/player access.
- `src/store.js`: Redux store with `loginReducer`, `coachReducer`, `teamReducer`, `redux-form`.
- `src/actions/`: Axios-backed async actions for login, dashboard profile, team details, player add, game entry.
- `src/pages/`: route-level views: `Home`, `Login`, `Register`, `Dashboard`, `TeamDetails`.
- `src/components/`: dashboard/team detail UI, forms, modal, navigation.

## Data Models

- `coaches`: identity/auth fields; related to teams through `coaches_teams`.
- `teams`: `name`, `city`, `state`, legacy `game_date`, and newer required `season`; related to coaches, players, and games.
- `players`: profile fields plus `position`; related to teams through `players_teams`.
- `stat_catalogs`: stat definitions such as `Hits`, `At Bats`, `Home Runs`, `Earned Runs`, `Innings Pitched`, `Strikeouts`.
- `players_stat_catalogs`: stat entries with `player_id`, `stat_catalog_id`, `how_many`, `game_date`, and newer nullable `game_id`.
- `games`: first-class game records with `team_id`, `opponent`, `game_date`.
- Derived stats are not persisted; they are computed per player from stat rows, optionally filtered by season.

## API Structure

- Base paths are mounted without an `/api` prefix: `/players`, `/coaches`, `/teams`, `/stats`, `/sessions`.
- `sessions`: login (`POST /sessions/login`) and logout (`DELETE /sessions`).
- `coaches`: authenticated coach profile reads, coach create/update, dashboard payload with team/player nesting, season selection, search filters, derived stats.
- `teams`: team list, authenticated team detail read, team create/update, add player to team, create game-based stat entry.
- `players`: authenticated player list/detail/stats, create/update/delete player, legacy direct stat create/update.
- `stats`: stat catalog reads.

## Important Dependencies

- Server/runtime: `express`, `body-parser`, `cors`, `helmet`, `morgan`.
- Auth/session: `express-session`, `connect-pg-simple`, `bcrypt`.
- Data: `pg`, `knex`, `bookshelf`, `bluebird`.
- Client: `react` 17, `react-dom`, `react-router-dom` 6, `axios`.
- State/forms: `redux`, `react-redux`, `redux-thunk`, `redux-form`, `redux-logger`.
- UI/build: `bulma`, `react-scripts`.
- Testing/linting: `supertest`, `chai`, `chai-http`, `mocha`, `eslint`.

## Risk Areas

- Routing mismatch risk: [`src/pages/TeamDetails.js`](/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js) reads `this.props.match.params`, but [`src/container/App.js`](/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js) uses React Router v6 `element={<TeamDetails />}` and does not inject `match`.
- Hard-coded client API URLs (`http://localhost:8080/...`) in actions reduce deploy flexibility and can break non-local environments.
- Session/origin handling is strict: `requireTrustedOrigin` rejects requests unless `Origin`/`Referer` exactly matches `CLIENT_ORIGIN`; this can be brittle across proxies or alternate hostnames.
- Login rate limiting is in-process memory only; it resets on restart and does not scale across instances.
- Data model drift: `highlander-react-redux-db.sql` reflects the older schema and does not show newer `season`, `games`, or `game_id` migration changes.
- Seed security issue: development seeds store plain-text passwords, while runtime login expects bcrypt hashes.
- Ownership logic is stronger than older patterns, but team/game stat attribution is still limited by legacy rows without `game_id` and by stats being season-scoped via `game_date`.
- Validation is mostly hand-written in routes; there is no shared schema validation layer.

## Assumptions / Unknowns

- Assumed `architecture.md` is current only where it matches route/model/migration code.
- Assumed `build/` is generated output and not the source of truth for client behavior.
- Assumed no separate service layer exists because route files contain most controller logic.
- Unknown whether any external reverse proxy or deployment platform rewrites origins/cookies.
- Unknown whether the React Router v6 migration is incomplete by design or currently broken in runtime.
- Unknown whether plain-text seed passwords are intentional for legacy local setups or an oversight.
