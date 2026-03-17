# Player Analytics And Derived Stats Plan

## Summary
Add v1 player analytics by computing derived metrics from existing raw stat totals and exposing them in the existing dashboard stats surface. Keep schema stable. Compute on server read, not in DB, not only in client. Use only metrics supportable by current catalog.

## Architecture overview
Monolith:
- Express server in `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`
- REST routers in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes`
- PostgreSQL via Knex + Bookshelf in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models`
- React 17 + Redux client in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src`

Feature fit:
- analytics derived in server response shaping
- Redux stores already consume coach/team payloads
- dashboard stats table already exists; extend it, do not add new page

## Detected technology stack
- Backend: Node, Express, body-parser, cors, helmet, morgan
- Auth: express-session, connect-pg-simple, bcrypt
- Data: PostgreSQL, Knex migrations, Bookshelf ORM
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk, redux-form
- HTTP: axios
- UI: Bulma, custom CSS
- Tests: react-scripts/Jest, supertest, mocha/chai present

## Files impacted
Primary:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Player.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`

Likely tests:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`

Optional doc updates if implementation changes API contract:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/README.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`

## Database changes
None for v1.

Reason:
- current `players_stat_catalogs` join table already holds raw numeric stat totals
- safest path: compute derived values at read time

Migration risks if later expanded:
- adding new stat categories like walks/doubles/triples changes seed assumptions and may require backfill
- storing derived metrics would create consistency risk with raw stat updates
- no migration recommended in v1

## API endpoints
Keep existing endpoints. Extend payloads, no new route in v1.

Primary endpoint:
- `GET /coaches/:id`
  - augment each player with `derivedStats`
  - metrics only from existing catalog:
    - `battingAverage = hits / atBats` when `atBats > 0`
    - `homeRunRate = homeRuns / atBats` when `atBats > 0`
    - `era = earnedRuns * 9 / inningsPitched` when `inningsPitched > 0`
    - `strikeoutsPerInning = strikeouts / inningsPitched` when `inningsPitched > 0`

Optional secondary parity endpoint:
- `GET /teams/:id`
  - same `derivedStats` shape if team detail later consumes analytics

Public interface addition:
- player objects in API responses gain:
  - `derivedStats.battingAverage`
  - `derivedStats.homeRunRate`
  - `derivedStats.era`
  - `derivedStats.strikeoutsPerInning`

Formatting default:
- server returns numbers or `null`; UI handles display formatting

## Frontend components
Use existing dashboard only.

Changes:
- `src/reducers/coachReducer.js`
  - stop hardcoding all stat derivation in reducer from pivot fields
  - preserve raw totals already shown
  - map server `derivedStats` into Redux state
- `src/components/StatsList.js`
  - add columns for derived metrics
  - show `--` for unavailable values
  - keep current totals columns
- no new route, no new page, no new global state slice

## Safest implementation approach
- compute analytics on server, closest to source data
- keep existing routes and auth model
- add derived metrics as additive fields only
- treat missing denominator as `null`, never divide by zero
- keep reducer compatible with old payload during transition if needed
- no DB migration, no background jobs, no new framework

## Risks and edge cases
- Current stat catalog is incomplete for richer baseball analytics; OBP/SLG cannot be computed correctly from existing schema
- Some players will have only batting or pitching stats; mixed table must handle partial metrics cleanly
- `inningsPitched` may be stored as integer totals only; if future data uses baseball fractional innings semantics, formula rules must be revisited
- Existing router code has brittle error handling; additive feature should avoid expanding that surface unnecessarily
- Large nested `GET /coaches/:id` payload grows further; acceptable for v1 but not ideal long-term

## Security concerns
- No new auth surface
- Validate all stat values used for math are numeric before computing
- Avoid leaking internal pivot field names beyond current contract changes
- Keep analytics additive; do not weaken existing session checks
- Do not trust client-computed analytics for any persisted behavior

## Testing strategy
Backend:
- route/integration test for `GET /coaches/:id` returns `derivedStats`
- cases:
  - complete batting stats
  - complete pitching stats
  - zero denominators return `null`
  - missing stat categories return `null`, not crash

Frontend:
- reducer test maps `derivedStats` into dashboard state
- component test renders derived stat values and `--` fallback

Regression:
- existing totals still render
- login/dashboard flow unchanged
- no schema/migration changes required

## Step-by-step implementation plan

Step 1: Lock analytics contract
Goal: define exact v1 metrics and response shape from existing data only
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
Changes:
- specify additive `derivedStats` fields for player records served to dashboard
- document unsupported metrics excluded from v1
Done when:
- one response shape is agreed: batting average, home run rate, ERA, strikeouts per inning; unsupported metrics explicitly out

Step 2: Add server-side analytics mapper
Goal: compute derived metrics from fetched player stats on read
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
Changes:
- add pure helper logic in route module or adjacent local helper
- compute metrics safely from related `teams.players.stats`
- attach `derivedStats` to each player in response
Done when:
- `GET /coaches/:id` returns each player with stable numeric-or-null `derivedStats`

Step 3: Add team endpoint parity
Goal: keep analytics shape consistent across coach/team reads
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
Changes:
- extend `GET /teams/:id` player payload with same `derivedStats` contract
Done when:
- coach and team player payloads expose the same analytics fields

Step 4: Update Redux state mapping
Goal: consume server-provided analytics without breaking current totals
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
Changes:
- map `derivedStats` into dashboard player stat objects
- preserve existing raw total mapping for Hits, AB, HR, ER, IP, Strikeouts
Done when:
- reducer state includes both totals and derived metrics for each dashboard player row

Step 5: Extend dashboard stats UI
Goal: surface analytics in existing dashboard table
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
Changes:
- add derived stat columns
- format decimals consistently
- render fallback placeholder for unavailable metrics
Done when:
- dashboard shows analytics beside totals without layout break on empty/partial data

Step 6: Backend test coverage
Goal: prevent formula and null-handling regressions
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
Changes:
- add endpoint tests for derivedStats presence and zero-denominator handling
Done when:
- tests prove no divide-by-zero and correct numeric output for representative payloads

Step 7: Frontend test coverage
Goal: verify reducer and rendering behavior
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
Changes:
- add reducer cases for server-provided `derivedStats`
- add component-level assertions if current test setup supports it
Done when:
- tests cover mapped state and placeholder rendering for null metrics

Step 8: Contract/docs refresh
Goal: keep repo docs aligned with feature behavior
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/README.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
Changes:
- note dashboard analytics availability and additive API contract
Done when:
- docs describe v1 analytics and no longer imply averages are wholly absent

## Assumptions
- v1 scope is dashboard only
- v1 uses compute-on-read, no persistence
- current stat catalog remains unchanged
- additive response fields are acceptable without versioning
- numbers can be returned raw and formatted in UI
- no Context7 lookup needed; repo behavior is clear enough

## Unresolved questions that must be answered before implementation
- Exact decimal formatting rule: raw numeric precision vs fixed display precision
- Whether `GET /teams/:id` parity is required in v1 or can slip to follow-up
- Whether product wants batting-only metrics shown for pitchers and pitching-only metrics shown for batters, or universal row display with `--`
- Whether future scope should add missing stat categories required for true OBP/SLG rather than current proxy-limited v1
