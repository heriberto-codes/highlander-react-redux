# Team Season Views Plan

## Summary
Backlog item: `- [ ] Team season views`

Add season-aware team browsing to existing dashboard and team detail flows. Persist season explicitly on `teams`. Use season selector/filter on dashboard and team details. Season-specific stats use `players_stat_catalogs.game_date` year. No new framework. Extend current monolith + Redux patterns.

## Architecture Overview
- Monolith unchanged: Express API in `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`, React/Redux client in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src`, PostgreSQL via Knex + Bookshelf.
- Source of truth for season:
  - team membership/viewing: `teams.season`
  - stat aggregation: `players_stat_catalogs.game_date` year
- Feature shape:
  - dashboard loads coach teams, available seasons, active season
  - team details loads one team plus season context
  - stats/roster scoped to selected season

## Detected Technology Stack
- Backend: Node, Express, body-parser, cors, helmet, morgan
- Data: PostgreSQL, Knex migrations/seeds, Bookshelf
- Auth: express-session, connect-pg-simple, bcrypt
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk
- HTTP/UI/Test: axios, Bulma, Jest via `react-scripts`, supertest

## Files Impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_migration_add_team_season>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_teams.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/playerAnalytics.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- Intended output path for this plan: `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/team_season_views_plan.md`

## Database Changes
- Add `season` integer, non-null, indexed, on `teams`.
- Backfill existing rows from `EXTRACT(YEAR FROM game_date)`; fallback only if null game_date encountered: current calendar year at migration time.
- Update seed teams to include explicit `season`.
- Migration risks:
  - existing rows with null/invalid `game_date` need safe default
  - future query behavior depends on `season`, so backfill correctness matters
  - no change to stats schema in v1; known attribution limit remains for same-season team transfers

## API Endpoints
Public contract additions:
- `GET /coaches/:id`
  - support optional query `season=<year>`
  - response adds `availableSeasons: number[]`
  - response adds `activeSeason: number | null`
  - `teams` filtered to selected season when query present
  - nested player stats/derived stats filtered to stat `game_date` year == active season
- `GET /teams/:id`
  - support optional query `season=<year>`
  - response includes team `season`
  - response includes `availableSeasons: number[]` for same coach/team name family
  - response player stats/derived stats filtered to active season year
- `POST /teams`
  - require `season`
- `PUT /teams/:id`
  - require `season`

No new route required in v1.

## Frontend Components
- Dashboard:
  - add season selector in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` or `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
  - update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js` to show season on each team row when useful
  - update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js` to render active-season stats only
- Team details:
  - add season selector in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` or `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
  - display team season in header
  - keep existing roster card layout; only change data scope

## Safest Implementation Approach
- Persist season on `teams`; do not derive from `game_date` at read time.
- Keep existing routes/pages; add query params and additive payload fields only.
- Filter stats by `players_stat_catalogs.game_date` year in server response shaping, closest to source.
- Preserve existing data contracts where possible; additive fields only, except `POST/PUT /teams` now require `season`.
- Keep Redux shape simple: store `availableSeasons`, `activeSeason`, season-filtered `teams`, season-filtered `stats`.

## Risks And Edge Cases
- Stats are not linked to team_id, only player + date; same-season transfers cannot be perfectly attributed.
- Existing seed data uses current timestamp; historical season UX depends on refreshed seed/migration data.
- `GET /coaches/:id` currently returns nested teams/players; season filtering must avoid breaking empty-state handling.
- Team names may repeat across seasons; selector logic must rely on team id + season, not name only.
- Missing or invalid `season` query should fall back to latest available season, not 500.
- Team with season but no dated stats must still show roster and `--` stats.

## Security Concerns
- Validate `season` as integer year; reject non-numeric input with 400.
- Keep existing session protections on write routes.
- Do not trust client-selected season for persistence without server validation.
- Avoid exposing unrelated teams when computing `availableSeasons`; scope by authenticated coach context where route already implies it.

## Testing Strategy
- Integration:
  - `GET /coaches/:id?season=YYYY` filters teams and stats to requested season
  - `GET /coaches/:id` defaults to latest season and returns `availableSeasons`
  - `GET /teams/:id?season=YYYY` returns season-scoped stats and season metadata
  - invalid `season` query returns 400
  - `POST /teams` and `PUT /teams/:id` reject missing/invalid `season`
- Reducer:
  - coach reducer stores `activeSeason`, `availableSeasons`, filtered teams/stats
  - team reducer stores `season`, `activeSeason`, `availableSeasons`
- UI:
  - dashboard season selector dispatches reload and updates lists
  - team detail selector reloads same team in selected season context
  - empty state for valid season with no stats/players remains stable

## Step-by-step Implementation Plan

Step 1: Add persisted season to teams
Goal: make season first-class and queryable
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_migration_add_team_season>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_teams.js`
Changes:
- add `teams.season` integer, non-null, indexed
- backfill from `game_date` year
- seed explicit season values
Done when:
- migration is reversible, existing rows receive season, seeds insert season cleanly

Step 2: Extend team write contract
Goal: require season on team create/update
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
Changes:
- validate `season` on `POST /teams` and `PUT /teams/:id`
- persist season field with team writes
Done when:
- create/update reject invalid season and return persisted season in response

Step 3: Add season-aware stat filtering helper
Goal: centralize year filtering for player stats and derived stats
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/playerAnalytics.js`
Changes:
- add helper to filter `player.stats` by year before raw/derived stat aggregation
- keep numeric/null derived stat behavior unchanged
Done when:
- helper can produce season-filtered player payloads without changing unrelated consumers

Step 4: Make coach dashboard endpoint season-aware
Goal: return filtered teams plus season metadata for dashboard
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
Changes:
- accept `season` query
- derive `availableSeasons` from coach teams
- default `activeSeason` to latest available
- filter returned teams to active season
- filter nested stats to active season year before derived stats
Done when:
- `GET /coaches/:id` returns stable payload with `availableSeasons`, `activeSeason`, season-scoped teams/stats

Step 5: Make team details endpoint season-aware
Goal: return selected team with season metadata and season-scoped stats
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
Changes:
- include `season` in team reads
- accept `season` query for stat filtering context
- compute `availableSeasons` from related coach/team records for same logical team family
Done when:
- `GET /teams/:id` includes team season, `activeSeason`, `availableSeasons`, season-filtered player stats

Step 6: Update dashboard data flow
Goal: let dashboard load and switch seasons
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
Changes:
- pass optional season query in fetch action
- store `availableSeasons` and `activeSeason`
- rebuild team/player/stat state from season-scoped payload
Done when:
- dashboard can fetch latest season by default and refetch on season change

Step 7: Add dashboard season UI
Goal: expose season selection without new route/page
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
Changes:
- render season selector
- show active season context in team/stats modules
- preserve current layout and empty states
Done when:
- user can switch seasons from dashboard and see teams/stats update

Step 8: Update team details data flow
Goal: let team page request and hold season context
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
Changes:
- fetch team with optional season query
- store team `season`, `availableSeasons`, `activeSeason`
- reload page data when season changes
Done when:
- team page state reflects selected season and keeps existing roster behavior

Step 9: Add team details season UI
Goal: expose season selector on team page
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
Changes:
- render season selector and season label
- keep roster cards unchanged except season-scoped data source
Done when:
- team page can switch season and header/roster reflect selected season

Step 10: Add server test coverage
Goal: lock API contract and filtering behavior
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
Changes:
- add cases for season query filtering, default latest season, invalid season, create/update validation
Done when:
- route tests cover main season paths and edge cases

Step 11: Add reducer/component test coverage
Goal: prevent client regressions
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
Changes:
- add season metadata mapping cases
- add assertions for season-switched payload handling
Done when:
- reducers prove stable for default and selected-season payloads

Step 12: Refresh architecture docs and plan artifact
Goal: align docs with new contract
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/team_season_views_plan.md`
Changes:
- document `teams.season`, season-aware endpoint behavior, known stat attribution limitation
- save this plan to docs/plans path
Done when:
- architecture doc reflects feature contract and plan file exists at requested path

## Assumptions
- v1 scope = existing dashboard + existing team details, not new season-only pages
- recommended defaults chosen:
  - filter + details scope
  - explicit `teams.season`
  - selected season controls team + roster + stats
  - season stats filtered by `players_stat_catalogs.game_date` year
- latest available season is default when query absent
- same-season player transfer ambiguity is acceptable for v1
- no Context7 lookup needed; repo behavior is clear from local code/docs

## Unresolved Questions That Must Be Answered Before Implementation
- How should `GET /teams/:id` compute `availableSeasons` if same coach owns multiple unrelated teams across seasons: by same team name, by explicit parent-team concept, or by all coach seasons? Current repo lacks that domain key.
- Exact allowed season range/validation rule: any 4-digit year vs bounded min/max.
- Whether team create/edit UI exists elsewhere outside current checked-in routes; repo shows placeholder links only.
