# Game-based Stat Entry Plan

## Implementation status
- Steps completed in repo:
  - Step 1 through Step 11
- Remaining follow-up after plan execution:
  - tighten `POST /teams/:id/games` authorization to verify team ownership
  - resolve legacy team details routing assumptions
  - expand server verification where sandbox allows full route test execution

## Summary
Backlog item: `- [ ] Game-based stat entry`

Add v1 game-scoped stat entry by introducing a first-class `games` record, then attaching per-player stat rows to that game. Keep current monolith, existing session auth, existing stat catalog, existing dashboard/team read contracts. v1 scope: create-only, team-roster entry, UI on team details page, required game metadata only `game_date` + `opponent`.

## Architecture overview
- Existing architecture holds: Express API in `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`, React/Redux client in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src`, PostgreSQL via Knex + Bookshelf.
- New write flow:
  - team details page loads roster
  - coach opens game stat entry form for one team
  - client submits one game payload plus per-player stat values
  - server creates `games` row, validates roster ownership, writes `players_stat_catalogs` rows linked to that game
- Existing read flow stays additive:
  - dashboard/team analytics can continue deriving totals from stat rows
  - season filtering can continue using `players_stat_catalogs.game_date` year
  - no new framework, no background jobs

## Detected technology stack
- Backend: Node, Express, body-parser, cors, helmet, morgan
- Data: PostgreSQL, Knex migrations/seeds, Bookshelf ORM
- Auth: express-session, connect-pg-simple, bcrypt
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk
- HTTP/UI/Test: axios, Bulma, Jest via `react-scripts`, supertest

## Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_create_games>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_add_game_id_to_players_stat_catalogs>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_stats.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Player.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/PlayerStat.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Game.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/playerRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- Intended plan path: `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/game_based_stat_entry_plan.md`

## Database changes
- Add `games` table:
  - `id`
  - `team_id` FK -> `teams.id`
  - `opponent` string not null
  - `game_date` datetime not null
- Add `game_id` nullable FK -> `games.id` on `players_stat_catalogs`
- Keep existing `player_id`, `stat_catalog_id`, `how_many`, `game_date`
- Write path sets both `players_stat_catalogs.game_id` and `players_stat_catalogs.game_date` from the created game
- Backfill existing stat rows with `game_id = null`; old data remains readable
- Migration risks:
  - old rows stay ungrouped, so game-based edit/history cannot cover legacy stats
  - `game_date` duplication across `games` and `players_stat_catalogs` must stay consistent on write
  - if later making `game_id` non-null, a backfill strategy will be needed first

## API endpoints
- Add `POST /teams/:id/games`
  - auth required
  - body:
    - `opponent`
    - `game_date`
    - `playerStats: [{ playerId, stats: [{ statCatalogId, howMany }] }]`
  - behavior:
    - verify team exists
    - verify submitted players belong to team
    - verify every `statCatalogId` exists
    - create one game
    - create one `players_stat_catalogs` row per non-zero stat entry with shared `game_id` + `game_date`
  - response:
    - created game summary with inserted stat row count
- Optional additive read for team page follow-up, not required for v1 create flow:
  - `GET /teams/:id/games`
- Existing endpoints remain:
  - `GET /coaches/:id`
  - `GET /teams/:id`
  - `POST /players/:player_id/stats/:stat_catalog_id`
  - keep old player-stat write routes for backward compatibility; mark as legacy in docs, not primary v1 path

## Frontend components
- Team details page is the entry surface
- Add button in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- Add form/modal in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js` or adjacent new component under `src/components/`
- State and submit flow in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- Form shape:
  - required game date
  - required opponent
  - one row per rostered player
  - one numeric input per existing stat catalog item
  - blank/zero values do not create stat rows

## Safest implementation approach
- Introduce `games` as additive schema, not a rewrite of existing stat reads
- Keep current analytics and season logic keyed off `players_stat_catalogs.game_date`
- Put all validation and fan-out write logic on server in one team-scoped endpoint
- Use DB transaction for game row + all stat rows
- Reuse existing stat catalog; do not add new stat types
- Reuse team details context to avoid cross-team selection complexity

## Risks and edge cases
- Team membership is not season-scoped at pivot level; current roster may not perfectly represent historical game rosters
- Existing legacy stat rows have no `game_id`
- Duplicate submissions can create duplicate games if user retries; v1 should accept this risk unless idempotency is added later
- Empty submission after validation should reject rather than create a stat-less game
- Negative/non-numeric stat values must reject
- Team with players but sparse stat input should still save only entered stats
- Current team details page already has routing/state inconsistencies; implementation should not widen them

## Security concerns
- Require authenticated session on new endpoint
- Verify team ownership or authorized access before write
- Verify every submitted player belongs to the target team
- Validate integer IDs, integer/non-negative stat values, valid date, non-empty opponent
- Use server-side stat catalog lookup; do not trust client labels
- Wrap writes in transaction to avoid partial game creation

## Testing strategy
- Integration:
  - `POST /teams/:id/games` creates one game and related stat rows
  - rejects unauthenticated request
  - rejects player not on team
  - rejects unknown stat catalog
  - rejects invalid date / empty opponent / negative stat
  - ignores zero or blank stat entries
  - preserves existing `GET /coaches/:id` and `GET /teams/:id` totals after inserted game stats
- Reducer/UI:
  - team reducer tracks submission state and success/error
  - form builds payload from roster rows correctly
  - submit button disabled or guarded when required metadata missing

## Step-by-step implementation plan

Step 1: Define game persistence contract
Goal: lock minimal v1 game shape and keep backward compatibility with existing stat rows
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
Changes:
- document `games` as first-class record
- document new create-only team-scoped game entry contract
- document legacy player-stat write routes as still supported but not primary
Done when:
- schema/API contract is explicit enough to implement without new product decisions

Step 2: Add games table
Goal: persist one record per entered game
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_create_games>.js`
Changes:
- create `games` with `team_id`, `opponent`, `game_date`
- add FK/indexes needed for team-scoped lookup
Done when:
- migration is reversible and supports team-linked game creation

Step 3: Link stat rows to games
Goal: let existing stat rows participate in game grouping without breaking old data
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_add_game_id_to_players_stat_catalogs>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_stats.js`
Changes:
- add nullable `game_id` FK to `players_stat_catalogs`
- update seeds so seeded stat rows can reference a game where practical
Done when:
- new rows can store `game_id`; old rows remain valid with null

Step 4: Add Bookshelf game model relations
Goal: expose game relations using existing ORM conventions
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Game.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/PlayerStat.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Player.js`
Changes:
- add `Game` model
- add `team -> games`
- add `player_stat -> game`
- keep current player/stat relations intact
Done when:
- route code can create/fetch games and related stat rows through Bookshelf

Step 5: Add server-side game creation endpoint
Goal: create one game and all submitted player stat rows safely
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`
Changes:
- add `POST /teams/:id/games`
- validate team, roster membership, stat catalog IDs, payload shape
- write game + stat rows in one transaction
Done when:
- endpoint returns 200/201 with created game summary and never leaves partial writes

Step 6: Preserve existing read behavior with new data
Goal: ensure dashboard/team analytics continue to work with `game_id`-backed rows
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/playerAnalytics.js`
Changes:
- confirm read logic still aggregates by existing stat pivot fields
- make only additive adjustments if relation loading changes require it
Done when:
- a game-entered stat row appears in current totals/derived stats without contract regression

Step 7: Add team action for game entry
Goal: create a client submit path matching existing Redux-thunk patterns
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
Changes:
- add request/success/error actions for game creation
- store submission/loading/error/success state
Done when:
- client can submit payload and reflect result in Redux state

Step 8: Add team-page entry workflow
Goal: expose create-only game stat entry from team context
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
Changes:
- add launch control on team page
- render form with opponent/date plus roster stat inputs
- submit through new team action
Done when:
- coach can enter one game for current team without leaving team details page

Step 9: Add server integration tests
Goal: lock new API behavior and prevent write-path regressions
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
Changes:
- add success and validation/error cases for `POST /teams/:id/games`
- assert inserted stats still influence existing read endpoints
Done when:
- route tests cover happy path, auth failure, validation failure, roster mismatch

Step 10: Add reducer/component tests
Goal: keep client state and form behavior stable
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
Changes:
- test submission state transitions
- test payload-building/required-field behavior at component level if current setup supports it
Done when:
- client tests catch broken submission state or malformed form behavior

Step 11: Refresh architecture docs and plan artifact
Goal: keep repo docs aligned with new write model
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/game_based_stat_entry_plan.md`
Changes:
- document `games` table and new endpoint
- save this plan at the requested docs path
Done when:
- docs reflect game-based stat entry as the primary v1 write path

## Assumptions
- v1 persists games in a new `games` table
- v1 requires only `game_date` and `opponent`
- v1 is create-only; no edit/delete/history UI
- v1 entry occurs from a specific team details page
- zero/blank stat inputs do not create DB rows
- existing player-stat routes remain for compatibility
- no Context7 lookup needed; repo behavior is clear enough

## Unresolved questions that must be answered before implementation
- Should roster eligibility use current team membership only, or should v1 support entering games for players no longer on the roster
- Should duplicate same-day same-opponent game creation be allowed, warned, or blocked
- Should v1 immediately add a game list/history on team details after save, or keep the first release write-only
