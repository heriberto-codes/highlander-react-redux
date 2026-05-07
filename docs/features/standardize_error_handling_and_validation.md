# Standardize error handling and validation

## Summary
- Added shared API error helpers in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/apiErrors.js`.
- Standardized common API failure responses around JSON payloads shaped as `{ error: ... }`, with optional `details` for non-500 helper-created errors.
- Normalized unexpected server errors through the shared helper path so unknown failures return HTTP 500 with only `{ error: 'Internal server error' }`.
- Migrated auth/origin middleware plus session, player, coach, and team handler failure branches to shared helpers while preserving status-code intent and protected-route decisions.
- Hardened API error recognition so plain objects cannot spoof trusted helper-created API errors.

## Architecture Impact
- Updated `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md` to document the shared API error and validation contract.
- Kept shared error behavior inside the existing `api/utils/` boundary.
- Kept request orchestration in `api/handlers/` and middleware behavior in `api/middleware/`.
- Did not introduce a schema validation framework, service layer, new endpoint namespace, or database-backed error system.

## Decisions
- Preserve existing route-specific human-readable messages while changing standardized failures to JSON payloads.
- Preserve existing auth, trusted-origin, ownership, collaboration, and transaction decision branches.
- Strip details from 500 responses and treat unknown thrown errors as generic internal server failures.
- Allow non-500 helper-created errors to include `details`, but only current safe call sites are used.
- Use `ApiError` instances, not the `isApiError` flag alone, as the trusted marker for final error middleware responses.

## API Changes
- No endpoint additions or removals.
- Failure responses touched by the refactor now use JSON bodies instead of older plain text or JSON string bodies.
- Representative standardized failures include:
  - HTTP 400 validation errors, such as missing or invalid fields.
  - HTTP 401 authentication errors for invalid credentials or stale sessions.
  - HTTP 403 forbidden errors for missing sessions, invalid origins, unauthorized ownership, or collaboration failures.
  - HTTP 404 not-found errors where the route intentionally distinguishes missing resources.
  - HTTP 429 login rate-limit errors.
  - HTTP 500 internal errors with only `{ error: 'Internal server error' }`.

## Database Changes
- None.
- Existing Bookshelf/Knex queries, authorization lookups, and the team game-entry transaction flow were preserved.

## Test Impact
- Added focused helper coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/apiErrors.test.js`.
- Added middleware coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/middlewareErrors.test.js`.
- Updated integration assertions in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` for representative standardized auth, trusted-origin, validation, not-found, rate-limit, and internal-error payloads.
- Focused validation commands run during the feature:
  - `CI=true npm test -- --runInBand src/apiErrors.test.js`
  - `CI=true npm test -- --runInBand src/server.test.js -t "coaches|teams/:id/coaches|POST /api/v1/teams rejects|PUT /api/v1/teams/:id rejects|POST /api/v1/teams/:id/games rejects|POST /api/v1/teams/:id/player rejects requests for a team outside"`

## Deployment Notes
- No environment variable changes are required.
- No migration, seed, build, or frontend deployment changes are required.
- Clients that parsed old plain-text failure bodies should be checked because standardized failures now return JSON bodies.

## Follow-ups / Accepted Risks
- Existing manual validation remains route-local and string-message based.
- Non-500 error helpers can expose `details`; current call sites do not pass sensitive details, but future usage should keep details limited to safe validation metadata.
- The server test suite mocks `ensureAuthenticated` in places, so mock fidelity should be maintained if middleware behavior changes again.
- Broader API rate limiting beyond login remains out of scope.
