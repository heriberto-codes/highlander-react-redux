# Add an auth/session bootstrap endpoint

Selected backlog item
- [ ] Add an auth/session bootstrap endpoint

## Architecture overview
- Current app: monolith Express server + React client + Redux store
- Auth: cookie-backed `express-session`, login at `POST /sessions/login`, logout at `DELETE /sessions`
- Gap: client has no bootstrap/read endpoint to rehydrate auth state after refresh; login state is local Redux only
- Safest feature shape: additive session-read endpoint under existing `/sessions` route, return minimal current-session coach payload, then bootstrap Redux on app load

## Detected technology stack
- Node.js + Express
- React 17 + React Router 6
- Redux + thunk-style async actions
- Axios on client
- Jest via `react-scripts test`
- `supertest` for server integration tests
- PostgreSQL session store via `connect-pg-simple`
- Bookshelf / Knex backend models

## Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/middleware/ensureAuthenticated.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`

## Database changes
- None expected
- Migration risk: none
- Session bootstrap should reuse existing session cookie + coach record only

## API endpoints
- Existing:
  - `POST /sessions/login`
  - `DELETE /sessions`
- New additive endpoint:
  - `GET /sessions`
  - Auth: session cookie required
  - Response on authenticated session: minimal coach/session payload for client bootstrap
  - Response on no session: `401` or explicit logged-out payload; choose one contract and keep tests/docs aligned

## Frontend components
- `App` should trigger bootstrap on initial load
- `loginAction` should gain bootstrap action creators/thunk
- `loginReducer` should track bootstrap loading/result without forcing redirect loops
- `Login` may need minor redirect logic adjustment if bootstrap state distinguishes unknown vs logged-out

## Safest implementation approach
- Reuse existing `/sessions` route namespace
- Keep payload minimal: only fields needed to restore auth/client identity
- Do not fetch full dashboard/team data in bootstrap route
- Keep route read-only; no side effects
- Keep existing login/logout behavior unchanged
- Add bootstrap as additive client startup flow; avoid touching unrelated routes/pages

## Risks and edge cases
- Refresh on protected route before bootstrap completes
- Bootstrap race with manual login/logout dispatches
- Stale Redux `shouldRedirect` behavior after refresh
- Session exists but referenced coach record missing/deleted
- Unauthorized bootstrap response causing flicker or redirect loop
- Existing client assumes boolean `isloggedIn`; bootstrap may need tri-state (`unknown`/`true`/`false`) or equivalent loading flag

## Security concerns
- Return minimal coach data only; avoid password/session internals
- Keep cookie-based auth + `withCredentials`
- Read endpoint does not need trusted-origin mutation protection, but must still require authentication for authenticated payloads
- Ensure no cross-coach lookup by path param; bootstrap should derive coach from session, not user input

## Testing strategy
- Server integration test for authenticated bootstrap success
- Server integration test for no-session bootstrap response
- Action test for bootstrap request/success/fail dispatch flow
- Reducer test for bootstrap state transitions
- App/container test for bootstrap firing on mount if repo already has a matching pattern
- Keep tests additive; do not rewrite login coverage

## Step-by-step implementation plan

Step 1: Lock contract
Goal: document exact bootstrap endpoint contract and client rehydration behavior
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js
Changes:
- document `GET /sessions` purpose, auth source, minimal response shape, logged-out behavior
Done when:
- docs and route comments describe one clear bootstrap contract with no ambiguity

Step 2: Add session bootstrap route
Goal: expose current authenticated session as a read endpoint
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/sessionRouter.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js
Changes:
- add `GET /sessions`
- read `req.session.coachId`
- fetch current coach record safely
- return minimal bootstrap payload
Done when:
- authenticated request returns session coach payload
- unauthenticated request returns the documented logged-out response

Step 3: Add backend route tests
Goal: lock bootstrap endpoint behavior before client wiring
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js
Changes:
- add `GET /sessions` success and no-session cases
- assert response excludes sensitive fields
Done when:
- server tests cover bootstrap route contract and auth behavior

Step 4: Add client bootstrap actions
Goal: create Redux action flow for session rehydration
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js
Changes:
- add bootstrap request/success/fail action types and thunk
- call new session endpoint with credentials
- add focused action tests
Done when:
- action layer can request bootstrap and tests cover dispatch flow

Step 5: Extend login reducer for bootstrap state
Goal: represent initial auth resolution without breaking existing login UX
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js
Changes:
- add bootstrap state handling
- preserve existing login/logout transitions
- add reducer tests for unknown/loading/authenticated/logged-out states
Done when:
- reducer supports startup auth rehydration and tests prove transitions

Step 6: Wire app startup bootstrap
Goal: trigger bootstrap when app loads
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js
Changes:
- dispatch bootstrap on mount
- avoid duplicate dispatches on rerender
- add/adjust app test if current test structure exists
Done when:
- app startup requests session bootstrap exactly once

Step 7: Align login page redirect behavior
Goal: prevent refresh flicker and preserve existing login redirects
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js
Changes:
- gate redirect/render logic on bootstrap-complete auth state
- keep manual login behavior intact
Done when:
- refresh on `/login` and protected navigation do not mis-handle in-progress bootstrap state

Step 8: Document shipped behavior
Goal: record final endpoint and client bootstrap flow
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/add_an_auth_session_bootstrap_endpoint.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md
Changes:
- mark feature complete
- document endpoint, payload, client startup flow
Done when:
- docs reflect implemented bootstrap contract and backlog item is checked

## Detected test framework and current test file conventions
- Framework: Jest via `react-scripts test`
- API integration: `supertest` in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- Redux/component/unit tests: `*.test.js` under `src/`
- Current convention is established; follow it exactly

## If no test convention exists, recommend one standard convention for this repo
- Not needed; repo already has a clear convention

## Assumptions
- Bootstrap endpoint should live under existing `/sessions` namespace, not a new `/auth` namespace
- Bootstrap should return a minimal coach payload, not full dashboard/profile data
- No DB schema change is needed
- Existing client login state may need one additional “resolved/unknown” concept to avoid refresh bugs

## Unresolved questions that must be answered before implementation
- No-session response contract: `401` vs `200` with explicit logged-out payload
- Exact bootstrap payload fields: only `id/email/first_name/last_name` vs reuse broader coach shape
- Whether any route protection should wait for bootstrap completion on the client, or only login page/dashboard should care
