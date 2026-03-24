# Coach Collaboration and Permissions

## Architecture overview

Coach collaboration is implemented as an additive feature on the existing monolithic Express + React/Redux application.

- Backend:
  - Express routes in `api/routes/teamRouter.js`
  - authorization helpers in `api/utils/authorization.js`
  - Bookshelf many-to-many relations in `api/models/Coach.js` and `api/models/Team.js`
- Data:
  - collaboration is stored on the existing `coaches_teams` join table
  - team-scoped role is persisted as `coaches_teams.role`
- Frontend:
  - team detail payload includes `collaborators` and `currentCoachRole`
  - Redux actions/reducer track collaborator fetch and mutation state
  - team details UI renders collaborator list plus owner-only management controls

The feature is scoped to existing coach accounts only. There is no invite/acceptance workflow in v1.

## Architectural decisions made

- Reused `coaches_teams` instead of adding a new collaboration table.
  - Keeps permissions close to the existing coach-team association.
- Used team-scoped roles.
  - Implemented roles are `owner` and `assistant`.
- Kept API changes additive.
  - `GET /teams/:id` now includes `collaborators` and `currentCoachRole`.
  - Dedicated collaborator CRUD routes were added under the existing team resource.
- Centralized role-aware checks in `api/utils/authorization.js`.
  - Routes use shared helpers for membership, owner checks, and last-owner protection.
- Chose `owner+assistant` for ordinary existing team/player/stat writes.
  - Only collaborator management remains owner-only.

## API endpoints

### Read collaborator data

`GET /teams/:id/coaches`

Rules:
- auth required
- any coach attached to the team may read

Response example:

```json
[
  {
    "id": 1,
    "email": "owner@example.com",
    "first_name": "Owner",
    "last_name": "Coach",
    "role": "owner"
  },
  {
    "id": 2,
    "email": "assistant@example.com",
    "first_name": "Assist",
    "last_name": "Coach",
    "role": "assistant"
  }
]
```

### Add collaborator

`POST /teams/:id/coaches`

Rules:
- auth required
- trusted origin required
- owner-only

Request example:

```json
{
  "coachId": 2,
  "role": "assistant"
}
```

Response example:

```json
{
  "id": 2,
  "email": "assistant@example.com",
  "first_name": "Assist",
  "last_name": "Coach",
  "role": "assistant"
}
```

### Update collaborator role

`PUT /teams/:id/coaches/:coachId`

Rules:
- auth required
- trusted origin required
- owner-only

Request example:

```json
{
  "role": "owner"
}
```

### Remove collaborator

`DELETE /teams/:id/coaches/:coachId`

Rules:
- auth required
- trusted origin required
- owner-only
- last owner cannot be removed

### Team detail enrichment

`GET /teams/:id`

Additional response fields:

```json
{
  "collaborators": [
    {
      "id": 1,
      "email": "owner@example.com",
      "first_name": "Owner",
      "last_name": "Coach",
      "role": "owner"
    }
  ],
  "currentCoachRole": "owner"
}
```

## Database changes

Migration added:
- `coaches_teams.role` as non-null string

Backfill:
- existing coach-team rows are backfilled to `owner`

Seed update:
- seeded coach-team associations now include explicit roles

Model change:
- coach/team many-to-many relations expose pivot `role` with `withPivot(['role'])`

## Example usage

### Owner adds an assistant collaborator

```http
POST /teams/9/coaches
Origin: http://localhost:3000
Content-Type: application/json

{
  "coachId": 2,
  "role": "assistant"
}
```

### Owner promotes a collaborator

```http
PUT /teams/9/coaches/2
Origin: http://localhost:3000
Content-Type: application/json

{
  "role": "owner"
}
```

### Assistant reads collaboration state from team detail

```http
GET /teams/9
```

Relevant response excerpt:

```json
{
  "collaborators": [
    {
      "id": 1,
      "role": "owner"
    },
    {
      "id": 2,
      "role": "assistant"
    }
  ],
  "currentCoachRole": "assistant"
}
```

### Frontend request flow

- Page mount dispatches `getTeamProfile(id, season, filters)`
- Team details page reads:
  - `collaborators`
  - `currentCoachRole`
  - collaborator mutation state from Redux
- Owner actions dispatch:
  - `addTeamCollaborator`
  - `updateTeamCollaborator`
  - `removeTeamCollaborator`

## Deployment considerations

- Run migrations before deploying the feature.
  - `coaches_teams.role` is required for collaborator auth logic.
- Seed data used in development/test must include explicit coach-team roles.
- Session and CSRF-style origin protections still depend on environment configuration:
  - `DATABASE_URL`
  - `CLIENT_ORIGIN`
  - `SECRET`
- Client actions still use a hard-coded `http://localhost:8080` base URL.
  - This is an existing deployment risk outside the collaboration feature itself.
- Known remaining gap:
  - the team details add-collaborator UI should reject empty coach ids before dispatch
  - server-side route validation still rejects the bad request safely

## Test coverage

Current test pattern remained unchanged.

- Backend route/integration coverage:
  - `src/server.test.js`
- Action coverage:
  - `src/actions/teamAction.test.js`
- Reducer coverage:
  - `src/reducers/teamReducer.test.js`
- UI/page/component coverage:
  - `src/pages/TeamDetails.test.js`
  - `src/components/TeamDetailsNavigation.test.js`
  - `src/components/TeamDetailsComponent.test.js`

No new test structure was introduced for this feature.
