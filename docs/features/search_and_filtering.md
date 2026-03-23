# Search And Filtering

## Architecture overview
This feature adds server-backed search and filtering to the existing coach dashboard and team detail flows without changing the app's monolithic architecture.

Flow:
- React pages collect filter input on explicit apply
- Redux actions serialize active filters into additive query params
- Express reuses existing `GET /coaches/:id` and `GET /teams/:id` endpoints
- route helpers normalize and validate filter input
- existing response-shaping logic narrows teams and players in memory
- Redux stores active filters so UI state survives request/response cycles
- list/detail components render distinct empty states for no-data vs no-match results

Primary implementation points:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/filterQuery.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/queryParams.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`

## Architectural decisions made
- Reuse existing read endpoints.
  Search/filtering shipped as additive query params on `GET /coaches/:id` and `GET /teams/:id` rather than new endpoints.
- Keep database unchanged for v1.
  Filtering uses the existing coach, team, player, and stat payloads already returned by current routes.
- Make the server the source of truth.
  Filters are applied in Express route shaping so returned payloads, season metadata, and derived stats stay consistent.
- Use explicit apply, not per-keystroke fetch.
  Dashboard and team detail views only refetch when the user applies filters or changes season.
- Preserve payload contracts.
  Top-level coach/team fields, `availableSeasons`, `activeSeason`, and `derivedStats` remain intact; only returned collections narrow.
- Centralize shared helper logic.
  Query normalization and matching live in `api/utils/filterQuery.js`; client query serialization lives in `src/actions/queryParams.js`.
- Differentiate empty states in the UI.
  Components render distinct messaging for "no data yet" vs "no matches for current filters".

## API endpoints
### Coach dashboard read
```http
GET /coaches/:id?season=<year>&teamSearch=<text>&playerSearch=<text>&position=<text>
```

Supported query params:
- `season`: optional integer year
- `teamSearch`: optional free-text team filter
- `playerSearch`: optional free-text player filter
- `position`: optional free-text player position filter

Behavior:
- text filters are trimmed
- empty or whitespace-only text filters are ignored
- invalid filter formats can return `400`
- valid filters with no matches return `200`
- `availableSeasons` and `activeSeason` stay present

### Team detail read
```http
GET /teams/:id?season=<year>&playerSearch=<text>&position=<text>
```

Supported query params:
- `season`: optional integer year
- `playerSearch`: optional free-text player filter
- `position`: optional free-text player position filter

Behavior:
- text filters are trimmed
- empty or whitespace-only text filters are ignored
- invalid filter formats can return `400`
- valid filters with no matches return `200`
- coach/team metadata, `availableSeasons`, and `activeSeason` stay present

## Database changes
None.

Rationale:
- no schema or migration was required for v1
- filtering reuses existing team season metadata and existing team/player relations
- rollout did not require seed or migration coordination

## Example usage
Dashboard request for a season plus team search:

```http
GET /coaches/12?season=2026&teamSearch=high
```

Dashboard request for player and position filtering:

```http
GET /coaches/12?playerSearch=lee&position=pitcher
```

Team detail request for a season plus roster filtering:

```http
GET /teams/56?season=2026&playerSearch=alex&position=catcher
```

Example dashboard payload excerpt:

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
          "first_name": "Alex",
          "last_name": "Lee",
          "position": "Catcher",
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

Example no-match behavior:

```json
{
  "id": 12,
  "availableSeasons": [2026, 2025],
  "activeSeason": 2026,
  "teams": []
}
```

## Deployment considerations
- No migration is required.
- Existing environment variables remain unchanged:
  - `DATABASE_URL`
  - `CLIENT_ORIGIN`
  - `SECRET`
  - `PORT`
- Safe rollout order:
  - deploy backend route/helper changes
  - deploy frontend action/reducer/page/component changes
  - verify dashboard and team detail filtering against seeded or staging data
- The feature depends on current session auth and current origin configuration; if `CLIENT_ORIGIN` is misconfigured, authenticated filter requests may fail.
- Filtering is currently applied after existing relation graphs are loaded. This is acceptable for current scope, but larger datasets may later need DB-level filtering or indexes.
- Existing test structure was reused:
  - route coverage in `src/server.test.js`
  - client/component/page coverage in `src/**/*.test.js`
  - no new test pattern was introduced, so no `agents.md` or `architecture.md` update was required for test conventions
