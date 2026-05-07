# Standardize error handling and validation

Selected backlog item
- [ ] Standardize error handling and validation

## Architecture grounding from `architecture.md`
- The server is an Express 4 monolith mounted from `server.js` with thin routers in `api/routes/` and request orchestration in `api/handlers/`.
- Existing shared logic should stay in `api/utils/` and `api/middleware/`; this repo explicitly avoids broad new abstraction layers.
- API behavior under `/api/v1` should remain additive and backward-compatible where possible, and auth/session boundaries must stay intact.
- Current validation is manual and route-local, and unhandled server errors already terminate in the final Express error middleware.

## Tech stack detected from `architecture.md` and confirmed against repo
- Express 4
- Bookshelf + Knex
- PostgreSQL
- React 17
- Redux with `redux-thunk`
- Jest via `react-scripts`
- `supertest` for server integration tests

## Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/ensureAuthenticated.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/requireTrustedOrigin.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/sessionHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/playerHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`

## Data / DB changes
- None expected.

## API endpoints
- No endpoint additions or removals are planned.
- Existing `/api/v1` routes should keep the same methods and access rules.
- This feature may normalize validation and error payload structure, but it should avoid widening route behavior beyond what current clients can safely consume.

## Frontend components
- None expected.

## Implementation approach
- Add a small shared server-side error/validation utility layer inside existing API server boundaries instead of introducing a third-party schema library or service layer.
- Standardize common response patterns first:
  - authentication failures
  - trusted-origin failures
  - not-found responses
  - required-field / invalid-field validation failures
  - unexpected internal errors
- Migrate the handler modules incrementally to shared helpers so changes stay reviewable and behavior drift is easier to catch.
- Preserve current auth, ownership, and transaction behavior while reducing duplicated stringly-typed validation code.

## Risks & edge cases
- Current routes mix plain strings, JSON strings, and JSON objects for failures; normalizing them can break tests or clients if done too aggressively.
- `src/server.test.js` currently asserts many route-specific messages and status codes, so response-shape changes need to be phased carefully.
- Team and coach handlers have the largest amount of inline validation and authorization branching, so they carry the highest regression risk.
- Some routes currently treat missing resources as `403`, `404`, or `400` depending on context; any standardization must distinguish intentional auth behavior from accidental inconsistency.

## Security concerns
- Preserve `ensureAuthenticated` and `requireTrustedOrigin` semantics exactly unless the plan step explicitly standardizes only their response format.
- Do not weaken ownership or collaborator authorization checks while extracting validation helpers.
- Avoid echoing sensitive internal error details to clients when standardizing server error responses.

## Testing strategy
- Keep `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` as the primary regression suite.
- Add or update integration assertions only for routes whose validation or error payloads are intentionally standardized in the current step.
- Verify both happy-path behavior and the shared failure cases:
  - unauthenticated requests
  - invalid trusted origin
  - missing required fields
  - invalid typed inputs
  - not-found vs unauthorized behavior where applicable

## Assumptions and unresolved questions
- Assumption: the safest target is server-side standardization only; no frontend changes are required in this feature.
- Assumption: a small shared helper module in `api/utils/` is acceptable within the current architecture, while a full schema-validation library is out of scope.
- Unresolved question: should the feature preserve existing human-readable error strings while only centralizing generation, or should it move to a consistent `{ error, details }` JSON shape in this same backlog item?
- Unresolved question: are all current mixed `400` vs `403` vs `404` responses intentional product behavior, or are some legacy inconsistencies safe to normalize now?

## Step-by-step plan
- [x] Step 1: Lock the target error and validation contract
Goal: define the standard response shapes and status-code rules this feature will enforce without drifting from current repo behavior
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/standardize_error_handling_and_validation_plan.md
Changes:
- document the intended shared validation/error boundary and call out which response inconsistencies will be preserved versus normalized
- capture the initial contract for auth, trusted-origin, validation, not-found, and internal-error responses
Done when:
- the plan and architecture guidance are specific enough to implement shared helpers without inventing behavior mid-refactor

- [x] Step 2: Add shared API error and validation helpers
Goal: introduce the smallest shared utility layer needed to remove duplicated response-building logic from handlers
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/
- /Users/hroman_codes/Documents/Code/highlander-react-redux/server.js
Changes:
- add shared helpers for common validation failures and API error responses
- align the final server error middleware with the chosen standardized internal-error response contract
Done when:
- shared helpers exist and can express the common server failure cases without changing route ownership logic

- [x] Step 3: Standardize middleware-level auth and origin failures
Goal: make the shared middleware produce the same response style as the rest of the API contract
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/ensureAuthenticated.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/requireTrustedOrigin.js
Changes:
- route middleware failures through the shared response helpers
- preserve existing protection semantics and status codes unless Step 1 explicitly changes them
Done when:
- unauthenticated and invalid-origin failures follow the same standardized response contract as handler-level failures

- [x] Step 4: Migrate session and player handlers to the shared validation/error helpers
Goal: standardize the smaller handler modules first to prove the helper contract on lower-risk routes
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/sessionHandlers.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/playerHandlers.js
Changes:
- replace duplicated missing-field and invalid-input response code with shared helpers
- preserve current route semantics for session bootstrap, login, player CRUD, and stat writes
Done when:
- session and player handlers use the shared helpers for validation and error responses with no unintended behavior drift

- [x] Step 5: Migrate coach and team handlers to the shared validation/error helpers
Goal: standardize the larger orchestration-heavy handlers after the helper contract is proven on smaller routes
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js
Changes:
- replace repeated validation/error response code with shared helpers across dashboard, collaboration, team write, and game-entry flows
- preserve filtering, authorization, and transaction behavior
Done when:
- coach and team handlers use the shared response helpers while keeping the same protected route behavior

- [x] Step 6: Lock the standardized contract with server integration coverage
Goal: prove the shared error/validation refactor did not regress protected routes and intentionally standardized failure responses
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js
Changes:
- add or update integration assertions for the standardized auth, validation, and internal-error response cases touched by the refactor
- keep coverage focused on representative routes rather than duplicating every branch
Done when:
- server integration tests explicitly validate the new shared error/validation contract on representative routes
