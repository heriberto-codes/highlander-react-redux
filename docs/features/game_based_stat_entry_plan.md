# Game-based Stat Entry

## Architecture overview
This feature adds game-scoped stat entry to the existing monolithic React/Redux and Express application.

Flow:
- game metadata is stored in PostgreSQL in `games`
- per-player stat rows remain stored in `players_stat_catalogs`
- each new game-entered stat row links back to `games.id` through nullable `game_id`
- Express accepts one team-scoped game payload and writes the game plus related stat rows in one transaction
- Redux stores game submission loading, success, and error state for the team page
- the team details page renders a game-entry form for the current roster and submits the payload through the existing thunk pattern

Primary implementation points:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/20260321000001_create_games.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/20260321000002_add_game_id_to_players_stat_catalogs.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Game.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/PlayerStat.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`

## Architectural decisions made
- Persist games as first-class records.
  A new `games` table was added instead of grouping stat rows only by date.
- Keep raw stat rows as the read source of truth.
  Existing analytics and season logic continue to rely on `players_stat_catalogs`.
- Additive schema change.
  `players_stat_catalogs.game_id` is nullable so legacy rows remain readable.
- Team-scoped create endpoint.
  One request creates one game and many stat rows for the selected team roster.
- Transactional write path.
  Game and stat rows are written inside one Bookshelf transaction to avoid partial saves.
- Reuse existing team details surface.
  v1 uses the team page instead of adding a new route or standalone page.

Current known limitations:
- `POST /teams/:id/games` does not yet verify team ownership against the authenticated coach
- the current team details page still depends on legacy route-param assumptions
- the client guards required metadata, but all-zero stat submissions still rely on server rejection

## API endpoints
Implemented endpoint:

- `POST /teams/:id/games`
  - auth required
  - creates one game and linked stat rows for one team
  - validates:
    - `opponent`
    - `game_date`
    - `playerStats`
    - submitted players belong to the target team
    - submitted stat catalog ids exist
    - non-negative integer stat values

Request body:

```json
{
  "opponent": "Lions",
  "game_date": "2026-03-28",
  "playerStats": [
    {
      "playerId": 1,
      "stats": [
        { "statCatalogId": 1, "howMany": 3 },
        { "statCatalogId": 2, "howMany": 4 }
      ]
    },
    {
      "playerId": 2,
      "stats": [
        { "statCatalogId": 6, "howMany": 5 }
      ]
    }
  ]
}
```

Response shape:

```json
{
  "id": 90,
  "team_id": 50,
  "opponent": "Lions",
  "game_date": "2026-03-28T00:00:00.000Z",
  "insertedStatRows": 3
}
```

Existing read endpoints remain in use:
- `GET /coaches/:id`
- `GET /teams/:id`

Those endpoints continue to read player stats from `players_stat_catalogs` and do not require new request parameters for game-based entry.

## Database schema
This feature adds two migrations.

Relevant schema:
- `games`
  - `id`
  - `team_id`
  - `opponent`
  - `game_date`
- `players_stat_catalogs`
  - `id`
  - `player_id`
  - `stat_catalog_id`
  - `how_many`
  - `game_date`
  - `game_id` nullable
- `teams`
  - `id`
  - `name`
  - `city`
  - `state`
  - `season`
- `players_teams`
  - current team membership

Migration behavior:
- create `games`
- add nullable `players_stat_catalogs.game_id`
- keep legacy stat rows valid with `game_id = null`

Seed behavior:
- seed teams now run before game seeds
- seeded games are inserted into `games`
- seeded stat rows attach `game_id` where a seeded game is available

## Example usage
Example request:

```http
POST /teams/50/games
Content-Type: application/json
```

```json
{
  "opponent": "Lions",
  "game_date": "2026-03-28",
  "playerStats": [
    {
      "playerId": 1,
      "stats": [
        { "statCatalogId": 1, "howMany": 3 },
        { "statCatalogId": 2, "howMany": 5 },
        { "statCatalogId": 3, "howMany": 1 }
      ]
    },
    {
      "playerId": 2,
      "stats": [
        { "statCatalogId": 6, "howMany": 4 },
        { "statCatalogId": 5, "howMany": 2 }
      ]
    }
  ]
}
```

Example UI behavior:
- open team details for a rostered team
- click `Add Game Stats`
- enter `opponent` and `game date`
- fill any non-zero player stat inputs
- submit the form
- Redux stores:
  - `isSubmittingGame`
  - `gameSubmissionSuccess`
  - `lastCreatedGame`
  - `gameSubmissionError`

## Deployment considerations
- Database migrations are required before backend deploy is usable:
  - create `games`
  - add nullable `players_stat_catalogs.game_id`
- Safe rollout order:
  - run migrations first
  - deploy backend next
  - deploy frontend after backend
- Seed updates should only be run where replacing seeded data is acceptable
- No new environment variables are required
- Monitor:
  - `POST /teams/:id/games` success and 4xx rates
  - transaction failures creating games/stat rows
  - team details form submission errors
  - read endpoints still returning correct totals and derived stats after game-based writes
- Known rollout caveats:
  - server test execution is limited in the current sandbox environment
  - team ownership enforcement on the write endpoint should be completed before production use
