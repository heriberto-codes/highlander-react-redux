# Separate route handlers from business logic

## Summary
- Refactored the server route layer so the main API routers now act as thin wiring modules and delegate request orchestration to domain handler modules.
- Added handler modules for sessions, players, coaches, and teams:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/sessionHandlers.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/playerHandlers.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js`
- Reduced the matching route files to middleware composition and route registration:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/playerRouter.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- Normalized the remaining route surface with light consistency cleanup in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/statRouter.js`.
- Preserved existing `/api/v1` endpoint behavior, middleware boundaries, payload shapes, and status-code behavior.

## Architecture Impact
- Updated `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md` to make the router-to-handler split the documented server pattern.
- Clarified that:
  - `api/routes/` remains the router boundary
  - `api/handlers/` owns request orchestration
  - shared logic stays in existing `api/utils/` and `api/middleware/`
  - this refactor does not introduce a broader service layer
- This keeps the Express monolith shape intact while reducing the size and responsibility of the heaviest route files.

## Decisions
- Extracted one handler module per major router instead of introducing deeper service abstractions.
- Kept helper functions close to their domain handlers unless they were already shared in `api/utils/`.
- Left `statRouter.js` as a small direct-read router and limited that step to consistency cleanup only.
- Preserved existing manual validation, authorization checks, trusted-origin enforcement, and transaction boundaries rather than redesigning them in this feature.

## API Changes
- No endpoint additions or removals.
- No request or response contract changes were intended.
- Protected routes still rely on:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/ensureAuthenticated.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/requireTrustedOrigin.js`

## Database Changes
- None.
- Existing Bookshelf/Knex models, relations, and the transaction-backed team game-entry flow were reused without schema changes.

## Test Impact
- No new test files were required for the final step because existing integration coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` already locked the highest-risk protected and stateful flows affected by the refactor.
- Existing coverage already exercises:
  - session bootstrap, login, logout, and repeated invalid-login rate limiting
  - coach profile reads, filtering, and notification shaping
  - team collaboration reads and writes
  - team detail filtering and collaboration metadata
  - team game-entry success and validation failures
  - player protected reads and stat write/update flows

## Deployment Notes
- No environment or deployment changes are required.
- This feature is server-structure-only and preserves the current route namespace, middleware stack, and database usage.

## Follow-ups / Accepted Risks
- Existing performance hotspots were preserved rather than optimized in this refactor, especially broad coach/team read payloads and per-stat-catalog validation in team game entry.
- Existing manual validation remains route-local and string-based; this refactor did not centralize validation.
- Public read access patterns on routes such as team and stat reads were preserved as existing behavior, not revisited here.
