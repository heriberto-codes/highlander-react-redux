# Player Analytics And Derived Stats

## Architecture overview
This feature adds derived player analytics to the existing monolithic React/Redux and Express application.

Flow:
- raw stat totals live in PostgreSQL in `players_stat_catalogs`
- Express reads player stats through Bookshelf relations
- server-side helpers derive analytics from raw stats
- additive `derivedStats` fields are returned in coach and team detail payloads
- Redux stores the derived metrics alongside raw totals
- the dashboard stats table renders both raw totals and derived metrics

Primary implementation points:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/playerAnalytics.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`

## Architectural decisions made
- Compute on read, not write.
  Raw stats remain the source of truth. Derived metrics are calculated at request time.
- Additive API contract.
  Existing player payloads were preserved and extended with `player.derivedStats`.
- Shared server mapper.
  Analytics logic was centralized in `api/utils/playerAnalytics.js` so coach and team endpoints stay aligned.
- No schema changes.
  Existing stat catalog and join-table data were sufficient for v1.
- Null instead of invalid math.
  Missing data or zero denominators return `null`, avoiding divide-by-zero behavior.
- Dashboard-first rollout.
  Analytics are surfaced in the existing stats table instead of adding a new page.

## API endpoints
Implemented endpoints:

- `GET /coaches/:id`
  - fetches coach, teams, players, and player stats
  - returns each player with additive `derivedStats`
- `GET /teams/:id`
  - fetches team, coach, players, and player stats
  - returns each player with additive `derivedStats`

`derivedStats` fields:
- `battingAverage`
- `homeRunRate`
- `era`
- `strikeoutsPerInning`

Behavior:
- values are numbers or `null`
- repeated stat rows for the same stat description are summed before calculation

Excluded from v1:
- OBP
- SLG
- OPS
- walks-based metrics
- doubles/triples-based metrics
- team leaderboards

## Database schema
No migrations were added for this feature.

Relevant existing tables:
- `players`
  - player identity and roster fields
- `stat_catalogs`
  - stat definitions such as `Hits`, `At Bats`, `Home Runs`, `Earned Runs`, `Innings Pitched`, `Strikeouts`
- `players_stat_catalogs`
  - join table storing:
    - `player_id`
    - `stat_catalog_id`
    - `how_many`
    - `game_date`
- `players_teams`
  - team membership
- `coaches_teams`
  - coach to team membership

Feature dependency on schema:
- analytics are derived from `players_stat_catalogs.how_many`
- duplicate stat rows are aggregated by stat description before formulas are applied

## Example usage
Example `GET /coaches/:id` player payload excerpt:

```json
{
  "id": 30,
  "first_name": "Slugger",
  "last_name": "Lee",
  "position": "Pitcher",
  "stats": [
    { "description": "Hits", "_pivot_how_many": 6 },
    { "description": "At Bats", "_pivot_how_many": 12 },
    { "description": "Home Runs", "_pivot_how_many": 3 },
    { "description": "Earned Runs", "_pivot_how_many": 4 },
    { "description": "Innings Pitched", "_pivot_how_many": 8 },
    { "description": "Strikeouts", "_pivot_how_many": 10 }
  ],
  "derivedStats": {
    "battingAverage": 0.5,
    "homeRunRate": 0.25,
    "era": 4.5,
    "strikeoutsPerInning": 1.25
  }
}
```

Dashboard rendering behavior:
- raw totals continue to show in the stats table
- derived metrics render in additional columns:
  - `AVG`
  - `HR Rate`
  - `ERA`
  - `K/IP`
- null values render as `--`
- displayed numeric precision is fixed to 3 decimal places

## Deployment considerations
- No database migration is required for rollout.
- No environment variable changes are required.
- Safe deploy order:
  - deploy backend and frontend together, preferred
  - backend-first is also safe because `derivedStats` is additive
  - frontend tolerates missing `derivedStats` by defaulting fields to `null`
- Performance impact is low for current payload sizes because calculations are simple in-memory arithmetic, but `GET /coaches/:id` and `GET /teams/:id` now do extra response shaping.
- Monitoring focus:
  - confirm coach and team detail endpoints still return 200s
  - watch for regressions in nested payload size and route latency
  - verify dashboard rendering for players with missing batting or pitching data
