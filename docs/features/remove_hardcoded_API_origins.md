# Remove hardcoded API origins

## Summary
- Removed hardcoded `http://localhost:8080` client API origins from the migrated Redux action modules.
- Client requests now use relative paths for:
  - session bootstrap and login
  - coach profile reads
  - team profile, add-player, game-entry, and collaborator requests
- Updated action tests to lock the relative URL contract.
- Aligned architecture and backlog documentation with the shipped behavior.

## Architecture Impact
- The client API URL contract is now:
  - client actions should not hardcode server origins
  - client actions should use relative API paths when browser and API share the same origin
  - route paths remain unchanged
  - credentialed Axios requests keep `withCredentials: true`
- This contract is implemented in:
  - `src/actions/loginAction.js`
  - `src/actions/coachAction.js`
  - `src/actions/teamAction.js`
- No reducer, page, server-route, or persistence changes were made.

## Decisions
- Used relative client URLs instead of localhost-bound absolute URLs.
- Kept the change scoped to existing action creators and matching action tests.
- Preserved the existing route contract instead of introducing a shared API helper or `/api` namespace in this feature.
- Preserved `withCredentials: true` on the credentialed requests already using it.

## API Changes
- No server endpoint changes.
- No payload shape changes.
- Client-side requests still target the same routes, now through relative paths:
  - `/sessions`
  - `/sessions/login`
  - `/coaches/:id`
  - `/teams/:id`
  - `/teams/:id/coaches`
  - `/teams/:id/games`
  - `/teams/:id/player`

## Database Changes
- None.

## Test Impact
- Updated action-level URL contract tests in:
  - `src/actions/loginAction.test.js`
  - `src/actions/coachAction.test.js`
  - `src/actions/teamAction.test.js`
- Team action coverage explicitly locks:
  - relative `/teams/:id...` profile requests
  - `/teams/:id/player`
  - `/teams/:id/games`
  - `/teams/:id/coaches...`
  - preserved `withCredentials: true`
- Focused verification run:
  - `npm test -- --runTestsByPath src/actions/teamAction.test.js --watchAll=false`

## Deployment Notes
- Relative client URLs now depend on same-origin serving or an equivalent local dev proxy/path setup.
- This removes the risk of shipping a client bundle tied to `http://localhost:8080`.
- Server-side trusted-origin enforcement is unchanged and still depends on `CLIENT_ORIGIN`.

## Follow-ups / Accepted Risks
- Accepted risk:
  - the relative URL contract depends on runtime routing being configured correctly so the browser can reach the Express API
- Follow-up not included in this feature:
  - introducing a shared client API helper
  - introducing an `/api` namespace or broader client/server URL abstraction
