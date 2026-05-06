# Separate route handlers from business logic

Selected backlog item
- [ ] Separate route handlers from business logic

## Architecture grounding from `architecture.md`
- The server is an Express 4 monolith mounted from `server.js` with route files in `api/routes/`.
- Route files currently act as both router and controller layer, while shared auth, filtering, analytics, and authorization logic already lives in `api/utils/` and `api/middleware/`.
- The architecture explicitly avoids premature service-layer indirection, so the safe refactor is to extract handler/controller modules first rather than inventing a broad new service architecture.
- API behavior, auth boundaries, payload shapes, and the `/api/v1` route contract must remain unchanged.

## Tech stack detected from `architecture.md` and confirmed against repo
- Express 4
- Bookshelf + Knex
- PostgreSQL
- React 17
- Redux with `redux-thunk`
- Jest via `react-scripts`
- `supertest` for server integration tests

## Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/playerRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/statRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/sessionHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/playerHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`

## Data / DB changes
- None expected.

## API endpoints
- No route additions or removals are planned.
- Existing `/api/v1` endpoints in `sessionRouter`, `playerRouter`, `coachRouter`, `teamRouter`, and `statRouter` should keep the same HTTP methods, auth requirements, payloads, and status-code behavior.

## Frontend components
- None expected.

## Implementation approach
- Refactor by extracting route callback bodies into domain-specific handler modules under `api/handlers/`.
- Keep router files responsible only for middleware composition, route registration, and importing the corresponding handlers.
- Reuse existing `api/utils/` helpers where logic is already shared instead of creating a large new service layer.
- Split the heaviest route files first around their natural domain boundaries:
  - session auth/bootstrap logic
  - player CRUD/stat handlers
  - coach dashboard/profile handlers
  - team detail/collaboration/game-entry handlers
- Preserve behavior through server integration coverage rather than changing client code.

## Risks & edge cases
- `teamRouter.js` contains the largest amount of inline validation, authorization, and transaction orchestration, so extraction there has the highest regression risk.
- `coachRouter.js` contains additive dashboard shaping, notifications, filtering, and season logic that can drift if helper closures are moved incorrectly.
- `playerRouter.js` mixes auth checks with response sanitization and nested stat writes; extraction must not weaken ownership enforcement.
- `sessionRouter.js` includes login attempt limiting stored in module state; moving handlers must preserve that state lifetime and keying behavior.
- Over-extracting into a deep service layer would conflict with the current architecture and create unnecessary abstraction.

## Security concerns
- Preserve `ensureAuthenticated` and `requireTrustedOrigin` wiring exactly.
- Preserve team/player ownership checks and coach path-id authorization checks.
- Preserve manual request validation and current error/status behavior.
- Do not widen read or write access while moving logic out of route files.

## Testing strategy
- Keep `src/server.test.js` as the primary regression suite for route behavior.
- Add or adjust server integration coverage only where the refactor changes handler wiring enough to justify explicit regression protection.
- Prefer verifying unchanged behavior for:
  - session bootstrap/login/logout
  - coach dashboard/profile reads
  - team collaboration routes
  - team game-entry writes
  - player CRUD/stat writes

## Assumptions and unresolved questions
- Assumption: extracting handler modules without adding a separate service layer is sufficient to satisfy the backlog item.
- Assumption: `statRouter.js` is small enough that it may only need light cleanup or may be left as-is if the main route/controller split is already achieved elsewhere.
- Unresolved question: should shared pure helper functions currently embedded inside `coachRouter.js` and `teamRouter.js` move into `api/utils/`, or is colocating them inside handler modules the better fit for this repo?
- Unresolved question: should the final desired structure be one handler file per router, or should `team` and `coach` handlers be further split by subdomain only if size still warrants it after extraction?

## Step-by-step plan
- [x] Step 1: Lock the target controller/handler structure
Goal: define the intended route-to-handler separation so the refactor stays consistent with the repo architecture
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
Changes:
- document the target boundary between router files, handler modules, and existing shared utils
- confirm that this feature stops at handler extraction and does not introduce a broad service layer
Done when:
- architecture doc describes the intended route/handler split clearly enough to guide the refactor

- [x] Step 2: Extract session route callbacks into handler modules
Goal: move session bootstrap, login, and logout logic out of `sessionRouter.js` while preserving middleware and rate-limit behavior
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/sessionHandlers.js
Changes:
- move session callback bodies and related helper functions into `sessionHandlers.js`
- leave `sessionRouter.js` focused on route registration and middleware wiring
Done when:
- `sessionRouter.js` primarily declares routes and delegates to imported handlers

- [x] Step 3: Extract player route callbacks into handler modules
Goal: separate player CRUD and player-stat request logic from router registration
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/playerRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/playerHandlers.js
Changes:
- move player read/write and stat callback bodies into `playerHandlers.js`
- preserve ownership checks, sanitization, and current response behavior
Done when:
- `playerRouter.js` is reduced to middleware plus imported player handlers

- [x] Step 4: Extract coach route callbacks into handler modules
Goal: isolate coach dashboard/profile mutation logic from router declaration
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js
Changes:
- move coach route callback bodies and route-local pure helpers into `coachHandlers.js`
- keep filtering, derived stats, notifications, and auth behavior unchanged
Done when:
- `coachRouter.js` delegates its route behavior through imported handlers

- [x] Step 5: Extract team route callbacks into handler modules
Goal: pull the largest orchestration logic out of `teamRouter.js` without changing team, collaboration, or game-entry behavior
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js
Changes:
- move team read/write, collaboration, and game-entry callback bodies into `teamHandlers.js`
- preserve transactions, authorization checks, filtering, and collaborator role rules
Done when:
- `teamRouter.js` is primarily route wiring and the heavy business logic lives in `teamHandlers.js`

- [x] Step 6: Normalize the remaining route surface
Goal: ensure all route files follow the same thin-router pattern after the extractions
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/playerRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/statRouter.js
Changes:
- align imports and exported handler usage across the route files
- apply light cleanup to `statRouter.js` only if needed for consistency with the new route/handler boundary
Done when:
- route files consistently read as thin routing layers across the API surface

- [x] Step 7: Lock behavior with server integration coverage
Goal: prove the route/handler refactor did not change externally visible server behavior
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js
Changes:
- update or add integration assertions only where needed to cover the extracted handler wiring and highest-risk flows
Done when:
- server integration coverage still validates the protected and stateful flows touched by the refactor
