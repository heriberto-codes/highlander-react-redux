# Team Season Views

## Architecture overview
This feature adds season-aware team browsing to the existing monolithic React/Redux and Express application.

Flow:
- team season metadata is stored in PostgreSQL on `teams.season`
- Express reads coach and team payloads through Bookshelf relations
- season-aware route logic filters coach dashboard teams by `teams.season`
- season-aware analytics helpers filter player stats by `players_stat_catalogs.game_date` year
- Redux stores `availableSeasons` and `activeSeason` for dashboard and team detail state
- dashboard and team detail views can request a selected season through query parameters

Primary implementation points:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/20260321000000_add_season_to_teams.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/playerAnalytics.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`

## Architectural decisions made
- Persist season on teams.
  Team season is a first-class field on `teams` rather than being inferred on every read.
- Filter stats by stat date year.
  Season-scoped player stats are derived from `players_stat_catalogs.game_date`.
- Additive API metadata.
  Existing payloads were extended with `availableSeasons` and `activeSeason` rather than introducing new endpoints.
- Reuse existing dashboard and team detail pages.
  The feature extends current routes and Redux state instead of adding new pages for v1.
- Shared server-side stat filtering.
  Season-aware stat filtering lives in `api/utils/playerAnalytics.js` so coach and team endpoints use the same logic.
- Same-name team family heuristic for team details.
  Team detail season options are derived from teams with the same `team.name` under the same coach.

Known limitation:
- player stats are dated but not linked to `team_id`
- if a player changes teams within the same season, season-filtered stats cannot be perfectly attributed to one team

## API endpoints
Implemented/extended endpoints:

- `GET /coaches/:id`
  - returns season-filtered teams for dashboard use
  - supports optional `?season=<year>`
  - returns `availableSeasons`
  - returns `activeSeason`
  - returns players with season-filtered `stats` and additive `derivedStats`

- `GET /teams/:id`
  - returns one team detail payload
  - supports optional `?season=<year>`
  - returns team `season`
  - returns `availableSeasons`
  - returns `activeSeason`
  - returns players with season-filtered `stats` and additive `derivedStats`

- `POST /teams`
  - requires `season`

- `PUT /teams/:id`
  - requires `season`

Season-related response fields:
- `season`
- `availableSeasons`
- `activeSeason`

Analytics fields preserved from the player analytics feature:
- `battingAverage`
- `homeRunRate`
- `era`
- `strikeoutsPerInning`

## Database schema
This feature adds one migration.

Relevant schema:
- `teams`
  - `id`
  - `name`
  - `city`
  - `state`
  - `game_date`
  - `season`
- `players_stat_catalogs`
  - `player_id`
  - `stat_catalog_id`
  - `how_many`
  - `game_date`
- `players_teams`
  - player to team membership
- `coaches_teams`
  - coach to team membership

Migration behavior:
- add `teams.season` as integer
- backfill `season` from `EXTRACT(YEAR FROM game_date)`
- fallback to current year if `game_date` is null
- enforce `NOT NULL`
- add an index on `season`

Seed behavior:
- seeded teams now include explicit `season` values
- seeded `game_date` values were aligned to the same season year

## Example usage
Dashboard request for the latest season:

```http
GET /coaches/12
```

Dashboard request for a selected season:

```http
GET /coaches/12?season=2025
```

Team detail request for a selected season:

```http
GET /teams/56?season=2025
```

Example season-aware dashboard payload excerpt:

```json
{
  "id": 12,
  "first_name": "Casey",
  "last_name": "Jones",
  "availableSeasons": [2026, 2025],
  "activeSeason": 2026,
  "teams": [
    {
      "id": 23,
      "name": "Highlanders",
      "season": 2026,
      "players": [
        {
          "id": 33,
          "first_name": "Rookie",
          "last_name": "Lee",
          "stats": [
            { "description": "Hits", "_pivot_how_many": 3, "_pivot_game_date": "2026-05-10T00:00:00Z" },
            { "description": "At Bats", "_pivot_how_many": 6, "_pivot_game_date": "2026-05-10T00:00:00Z" }
          ],
          "derivedStats": {
            "battingAverage": 0.5,
            "homeRunRate": null,
            "era": null,
            "strikeoutsPerInning": null
          }
        }
      ]
    }
  ]
}
```

Example team create payload:

```json
{
  "name": "Highlanders",
  "city": "Bronx",
  "state": "NY",
  "coachId": 1,
  "season": 2026
}
```

## Deployment considerations
- Database migration is required before team create/update flows can succeed with the new `season` field.
- Safe rollout order:
  - run migration first
  - deploy backend changes next
  - deploy frontend changes after backend
- Seed data should be rerun only in environments where replacing team rows is acceptable.
- No new environment variables are required.
- Monitor:
  - `GET /coaches/:id` response shape and latency
  - `GET /teams/:id` response shape and season metadata
  - `POST /teams` and `PUT /teams/:id` validation failures for missing/invalid `season`
- Known rollout caveat:
  - team detail season-family lookup currently uses same-name matching, so duplicate team names under one coach may group seasons incorrectly
