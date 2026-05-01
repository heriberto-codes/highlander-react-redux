# Introduce an `/api` namespace and versioning

## Summary
- Introduced a versioned API namespace at `/api/v1` for the existing server route groups.
- Migrated the server integration tests and client action callers to the versioned contract.
- Updated action tests to lock the `/api/v1` client URL contract.
- Removed the old top-level server mounts after the repository no longer depended on them.
- Aligned architecture and backlog documentation with the shipped versioned API behavior.

## Architecture Impact
- The repository API contract is now versioned and path-based under `/api/v1`.
- The active server route groups are:
  - `/api/v1/players`
  - `/api/v1/coaches`
  - `/api/v1/teams`
  - `/api/v1/stats`
  - `/api/v1/sessions`
- The repository no longer relies on or exposes the old top-level API mounts as its supported contract.
- Client action callers and tests were migrated without changing payload shape, query serialization, or credential behavior.

## Decisions
- Used additive server mounts first, then removed legacy top-level mounts only after repo consumers were migrated.
- Kept route-handler logic unchanged and scoped the versioning change to mount paths, client URLs, and matching tests.
- Preserved existing auth, trusted-origin enforcement, and response payloads under the new namespace.
- Chose path-based versioning under `/api/v1` instead of introducing a separate API layer or broader abstraction.

## API Changes
- Server API routes now resolve through `/api/v1/...` only:
  - `POST /api/v1/sessions/login`
  - `GET /api/v1/sessions`
  - `GET /api/v1/coaches/:id`
  - `GET /api/v1/teams/:id`
  - `GET /api/v1/teams/:id/coaches`
  - `POST /api/v1/teams/:id/coaches`
  - `PUT /api/v1/teams/:id/coaches/:coachId`
  - `DELETE /api/v1/teams/:id/coaches/:coachId`
  - `POST /api/v1/teams/:id/games`
  - `POST /api/v1/teams/:id/player`
  - `PUT /api/v1/players/:id`
  - `POST /api/v1/players/:player_id/stats/:stat_catalog_id`
  - `PUT /api/v1/players/:player_id/stats/:stat_catalog_id`
  - `DELETE /api/v1/players/:id`
- No payload-shape changes were introduced by this feature.

## Database Changes
- None.

## Test Impact
- Updated server integration coverage in `src/server.test.js` to exercise the versioned server routes.
- Updated client action URL contract tests in:
  - `src/actions/loginAction.test.js`
  - `src/actions/coachAction.test.js`
  - `src/actions/teamAction.test.js`
- Existing assertions for payloads, dispatch order, query serialization, auth checks, and `withCredentials: true` were preserved while moving to `/api/v1/...`.

## Deployment Notes
- The shipped repository contract now expects `/api/v1/...` paths for API traffic.
- Any deployment or proxy setup must route `/api/v1/...` requests to the Express server.
- Removing the legacy mounts is safe for this repository because the client callers and test suite were migrated first.

## Follow-ups / Accepted Risks
- Accepted risk:
  - external consumers outside this repository, if any exist, may still depend on the old top-level routes
- Follow-up not included in this feature:
  - introducing broader API abstractions or a separate service layer
  - adding explicit negative integration assertions for every removed top-level route
