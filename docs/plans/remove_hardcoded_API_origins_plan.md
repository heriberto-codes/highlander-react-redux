# Remove hardcoded API origins

Selected backlog item
- [ ] Remove hardcoded API origins

## Architecture overview
- Current app is monolithic: React client in `src/`, Express API in `server.js`
- Client async actions call server routes directly with Axios
- Problem: several client action files hardcode `http://localhost:8080/...`
- Safest fix: centralize client API base URL construction and migrate action files to it without changing server routes

## Tech stack detected
- React 17
- React Router 6
- Redux + `redux-thunk`
- Axios
- Express 4
- PostgreSQL
- Knex + Bookshelf
- Jest via `react-scripts`
- `supertest` for server tests

## Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/remove_hardcoded_API_origins.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md`

## Database changes
- None

## API endpoints
- No server endpoint changes
- Existing client targets stay the same:
  - `/sessions`
  - `/sessions/login`
  - `/coaches/:id`
  - `/teams/:id`
  - `/teams/:id/coaches`
  - `/teams/:id/games`

## Frontend components
- No page/component behavior change expected
- Scope is client action layer only

## Implementation approach
- Prefer relative URLs or one shared client URL builder
- Keep Axios `withCredentials: true`
- Migrate one action module at a time
- Update only matching action tests per step
- Avoid touching page/reducer code unless a test proves necessary

## Risks and edge cases
- Relative URLs may behave differently in local dev vs production if proxy assumptions are wrong
- Query-string serialization tests will need exact expected URL updates
- Mixed hardcoded + relative URLs during partial rollout can be confusing if steps are not isolated
- Session/bootstrap routes must keep cookie behavior unchanged

## Security concerns
- Preserve credentialed requests
- Do not widen origins or alter `requireTrustedOrigin` server behavior
- Avoid leaking environment assumptions into client bundles beyond what already exists

## Testing strategy
- Action-unit tests only for this feature
- Verify each migrated action file still calls Axios with the correct path and `withCredentials`
- No server tests needed because endpoints do not change

## Step-by-step plan

- [x] Step 1: Lock contract
Goal: document the intended client URL strategy and target scope
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
Changes:
- document that client actions should not hardcode server origins and should use relative API paths
Done when:
- architecture doc states one clear client API URL contract

- [x] Step 2: Migrate login actions
Goal: remove hardcoded origin from session/login client actions
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js
Changes:
- replace hardcoded absolute session URLs with the chosen client URL strategy
Done when:
- login/bootstrap actions no longer contain `http://localhost:8080`

- [x] Step 3: Update login action tests
Goal: lock the new session/login URL contract
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js
Changes:
- update expected Axios URLs for login/bootstrap actions
Done when:
- login action tests pass with the new URL contract

- [ ] Step 4: Migrate coach actions
Goal: remove hardcoded origin from coach profile client actions
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js
Changes:
- replace hardcoded absolute coach URLs with the chosen client URL strategy
Done when:
- coach actions no longer contain `http://localhost:8080`

- [ ] Step 5: Update coach action tests
Goal: lock the new coach action URL contract
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js
Changes:
- update expected Axios URLs for coach profile actions
Done when:
- coach action tests pass with the new URL contract

- [ ] Step 6: Migrate team actions
Goal: remove hardcoded origin from team and collaboration client actions
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js
Changes:
- replace hardcoded absolute team URLs with the chosen client URL strategy
Done when:
- team actions no longer contain `http://localhost:8080`

- [ ] Step 7: Update team action tests
Goal: lock the new team action URL contract
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js
Changes:
- update expected Axios URLs for team, collaborator, and game-entry actions
Done when:
- team action tests pass with the new URL contract

- [ ] Step 8: Document shipped behavior
Goal: record the new client API URL contract and mark backlog complete
Files:
- /Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/remove_hardcoded_API_origins.md
- /Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md
Changes:
- update docs to reflect relative/shared client API URLs
- check off backlog item
Done when:
- docs and backlog match implementation

## Assumptions
- Relative client URLs are acceptable when the browser and API are served through the same origin, or when local development provides an equivalent proxy/path setup
- No separate API client abstraction currently exists and introducing one should stay minimal
- Only client action files currently need migration for this backlog item

## Unresolved questions
- Should the final contract be pure relative paths like `/sessions`, or a tiny shared helper that still supports optional base-prefix config?
- Is any local dev proxy setup expected, or does the current Express-served SPA path make relative URLs sufficient everywhere?
