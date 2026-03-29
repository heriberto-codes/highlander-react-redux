# Notifications and reminders

## Architecture overview
- Implemented scope is server-side only.
- Express enriches `GET /coaches/:id` with additive notification data.
- Notifications are stored in PostgreSQL in `coach_notifications`.
- Bookshelf relations connect notifications to coaches, teams, and games.
- Reminder generation is read-time only in the current implementation:
  - source data is existing `teams.games`
  - due reminders are computed from `games.game_date`
  - no worker, cron, email, SMS, push, or background delivery exists

## Architectural decisions made
- Keep v1 in-app only.
- Reuse the existing dashboard read instead of adding a second dashboard bootstrap path.
- Keep `GET /coaches/:id` read-only.
  - due reminders are computed in memory
  - route does not persist notification rows during a read
- Use `idempotency_key` to support future duplicate-prevention when durable reminder materialization is added.
- Keep response changes additive:
  - `notifications`
  - `unreadNotificationCount`
- Defer notification mutation routes and dashboard UI to later steps.

## API endpoints

### Implemented
- `GET /coaches/:id`
  - existing authenticated dashboard read
  - now includes additive fields:
    - `notifications`
    - `unreadNotificationCount`

### Current response additions
```json
{
  "id": 10,
  "first_name": "Casey",
  "last_name": "Jones",
  "teams": [],
  "availableSeasons": [2026],
  "activeSeason": 2026,
  "notifications": [
    {
      "id": 7,
      "coach_id": 10,
      "team_id": 20,
      "game_id": 21,
      "kind": "upcoming_game",
      "message": "Highlanders has an upcoming game against Rivals.",
      "scheduled_for": "2026-03-30T12:00:00.000Z",
      "read_at": null,
      "dismissed_at": null,
      "created_at": "2026-03-29T12:00:00.000Z",
      "idempotency_key": "upcoming_game:10:20:21"
    }
  ],
  "unreadNotificationCount": 1
}
```

### Not implemented yet
- `GET /coaches/:id/notifications`
- `PUT /coaches/:id/notifications/:notificationId`
- client-side dashboard notification UI

## Database changes
- Added table: `coach_notifications`
- Migration:
  - [data/migrations/20260326000000_create_coach_notifications.js](/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/20260326000000_create_coach_notifications.js)

### Table shape
- `id` primary key
- `coach_id` required FK to `coaches`
- `team_id` nullable FK to `teams`
- `game_id` nullable FK to `games`
- `kind` required string
- `message` required text
- `scheduled_for` nullable datetime
- `read_at` nullable datetime
- `dismissed_at` nullable datetime
- `idempotency_key` nullable unique string
- `created_at` required datetime with default `now()`

### Current use
- persistence exists for notification rows
- current Step 5 dashboard read consumes persisted notifications and also computes due reminders from loaded games
- current route does not create/update notification rows during `GET /coaches/:id`

## Example usage

### Dashboard read
```http
GET /coaches/10
Cookie: connect.sid=...
```

### What the route does today
- validates authenticated coach id matches `:id`
- loads:
  - teams
  - team players/stats
  - team games
  - existing notifications
- computes due upcoming-game reminders within the next 24 hours
- excludes dismissed notifications
- deduplicates computed reminders against persisted notifications by `idempotency_key`
- sorts notifications newest-first by `scheduled_for`
- returns at most 10 notifications

## Deployment considerations
- Run migrations before using notification reads:
  - `npm run migrate`
- No new environment variables are required for the implemented scope.
- No new worker or scheduler process is required.
- Because reminder generation is read-time only, reminders appear only when the dashboard endpoint is requested.
- Payload size on `GET /coaches/:id` increases because the route now loads:
  - `teams.games`
  - `notifications`
- If dashboard latency grows in production, the next optimization should be narrowing the loaded games set to an upcoming window instead of loading full team game history.

## Test structure
- No new test structure was introduced.
- Existing repo pattern remains the source of truth:
  - Jest `*.test.js` under `src/`
  - route/integration coverage in [src/server.test.js](/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js)
  - focused utility tests in files like [src/notifications.test.js](/Users/hroman_codes/Documents/Code/highlander-react-redux/src/notifications.test.js)

## Current implementation limits
- No notification mutation endpoints yet
- No dashboard notification UI yet
- No durable reminder materialization path yet
- No email/SMS/push delivery
- Reminder source is only upcoming games from existing `game_date`
