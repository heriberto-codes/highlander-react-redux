# Introduce an `/api` namespace and versioning

Selected backlog item
- [ ] Introduce an `/api` namespace and versioning

## Architecture grounding from `architecture.md`
- Current system is a monolithic React SPA plus Express 4 server with route handlers mounted directly in `server.js`.
- API routes are currently mounted at top-level resource paths such as `/teams`, `/coaches`, `/players`, `/stats`, and `/sessions`.
- Client requests use relative URLs and credentialed Axios requests with `withCredentials: true`.
- Route files act as the controller layer today, so the safest versioning change is mount-level wiring in `server.js`, not a route-handler rewrite.
- Architecture prefers additive API changes where possible and avoiding broad structural rewrites.

## Tech stack detected from `architecture.md` and confirmed against repo
- React 17
- Redux with `redux-thunk`
- Axios
- Express 4
- PostgreSQL
- Bookshelf + Knex
- Jest via `react-scripts`
- `supertest` for server integration tests

## Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/introduce_api_namespace_and_versioning.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md`

## Data / DB changes
- None

## API endpoints
- Introduce versioned mounts under `/api/v1` for the existing route groups:
  - `/api/v1/players`
  - `/api/v1/coaches`
  - `/api/v1/teams`
  - `/api/v1/stats`
  - `/api/v1/sessions`
- Keep endpoint behavior and payload shapes unchanged.
- Safest rollout is additive first, then decide whether the legacy top-level mounts can be removed once client and tests are migrated.

## Frontend components
- No page/component structure changes expected.
- Client action URL construction changes in:
  - `src/actions/loginAction.js`
  - `src/actions/coachAction.js`
  - `src/actions/teamAction.js`

## Implementation approach
- First lock the architecture contract for versioned API paths and backward-compatibility expectations.
- Add `/api/v1` mounts in `server.js` by reusing the existing routers instead of cloning route logic.
- Update server integration coverage to exercise the new namespaced paths before migrating client callers.
- Migrate client action URLs from root-relative resource paths to relative `/api/v1/...` paths while preserving credentials and query serialization.
- Update matching client action tests to lock the new URL contract.
- After the client and tests are green, remove legacy top-level mounts only if repo usage shows no remaining dependency on unversioned paths.

## Risks & edge cases
- Removing legacy mounts too early can break existing client calls, tests, or direct route consumers.
- The React fallback route in `server.js` must continue serving non-API GET requests without swallowing `/api/v1/...` requests.
- Same-origin assumptions still apply; `/api/v1/...` must resolve correctly in local dev and production.
- Session and trusted-origin behavior must remain unchanged under the new prefix.
- Any hidden references to unversioned paths outside the current action files could be missed if the route search is incomplete.

## Security concerns
- Preserve `ensureAuthenticated` and `requireTrustedOrigin` behavior exactly.
- Preserve session cookie behavior and `withCredentials: true` on client requests.
- Do not widen CORS or introduce parallel unauthenticated routes while versioning.
- Keep response payloads and auth boundaries unchanged during the namespace migration.

## Testing strategy
- Update `src/server.test.js` to cover `/api/v1` route behavior for session, coach, team, player, and collaboration flows touched by existing integration tests.
- Update action tests in:
  - `src/actions/loginAction.test.js`
  - `src/actions/coachAction.test.js`
  - `src/actions/teamAction.test.js`
- Verify that query-string serialization and credentialed Axios calls remain unchanged except for the `/api/v1` prefix.
- If legacy mounts are removed in a later step, ensure tests no longer rely on top-level unversioned paths.

## Assumptions and unresolved questions
- Assumption: there are no external consumers that depend on the current unversioned routes beyond this repository’s client and tests.
- Assumption: same-origin serving or an equivalent proxy/path setup will route `/api/v1/...` correctly.
- Unresolved question: should the completed feature preserve legacy top-level mounts temporarily for compatibility, or is full cutover within this repo sufficient for completion?
- Unresolved question: should `statRouter` and `playerRouter` be migrated in the same feature even though current client actions do not call them directly?

## Step-by-step plan
- [x] Step 1: Lock the `/api/v1` contract
Goal: document the versioned API strategy, compatibility expectations, and target route prefix
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
Changes:
- document that API routes move under `/api/v1`
- state whether legacy top-level mounts remain temporarily during migration
Done when:
- architecture doc defines one clear versioned API contract

- [x] Step 2: Add versioned server mounts
Goal: expose the existing routers under `/api/v1` without changing route-handler logic
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/server.js
Changes:
- mount the existing routers under `/api/v1/...`
- preserve existing middleware order and React fallback behavior
Done when:
- the server exposes versioned route mounts for all current resource groups

- [x] Step 3: Lock server behavior for namespaced routes
Goal: prove the new `/api/v1` mounts behave like the existing routes
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js
Changes:
- update or add integration assertions for `/api/v1` paths across existing covered flows
Done when:
- server tests validate the versioned namespace for the migrated route groups

- [x] Step 4: Migrate client actions to `/api/v1`
Goal: switch the existing client action callers to the versioned relative API paths
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js
Changes:
- replace root-relative resource paths with relative `/api/v1/...` paths
- preserve query serialization and `withCredentials: true`
Done when:
- the migrated client action files call only `/api/v1/...` paths

- [x] Step 5: Update client action tests
Goal: lock the new versioned client URL contract
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js
Changes:
- update expected Axios URLs to `/api/v1/...`
Done when:
- action tests pass with the versioned URL contract

- [x] Step 6: Remove legacy top-level mounts if safe
Goal: complete the namespace migration by eliminating unversioned server mounts only if no repo consumers still depend on them
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/server.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js
Changes:
- remove top-level route mounts if the repo is fully migrated
- update any remaining integration expectations accordingly
Done when:
- the repo no longer depends on unversioned API mounts, or the plan explicitly documents why compatibility mounts remain

- [x] Step 7: Document shipped versioning behavior
Goal: record the final `/api/v1` contract and mark the backlog item complete
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/introduce_api_namespace_and_versioning.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md
Changes:
- update docs to reflect the final namespaced API behavior
- check off backlog item
Done when:
- docs and backlog match the shipped versioning behavior
