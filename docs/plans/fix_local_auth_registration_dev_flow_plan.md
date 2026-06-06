# Fix local auth and registration dev flow

Selected backlog item
- [ ] Fix local auth and registration dev flow

feature_slug
- fix_local_auth_registration_dev_flow

## Architecture grounding from architecture.md

- Highlander is a monolithic Express 4 + React 17 + Redux application.
- API routes are mounted under `/api/v1`.
- Data flows from React + Redux + Axios to Express route handlers, then Bookshelf/Knex, then PostgreSQL.
- Authentication is session-backed with `express-session`.
- Test environments use `MemoryStore`; non-test runtime uses `connect-pg-simple` with PostgreSQL.
- Mutating API routes generally use `requireTrustedOrigin`; protected resources also use `ensureAuthenticated`.
- Client actions should use relative `/api/v1/...` URLs with `withCredentials`.
- Schema changes live in `data/migrations/`; seed data lives in `data/seeds/`.

## Tech stack detected from architecture.md and confirmed against repo

- Node.js + Express
- React 17 + React Router 6
- Redux + redux-thunk
- Axios
- PostgreSQL
- Knex + Bookshelf
- `express-session` + `connect-pg-simple`
- `bcrypt`
- Jest via `react-scripts test --env=jsdom`
- `supertest` for API tests
- ESLint via `npm run lint`

## Files impacted

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/sessionHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_create_session_table>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_coaches.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RegisterForm.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Register.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Register.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/README.md`

## Data / DB changes

- Add a migration for the `session` table required by `connect-pg-simple`.
- Match the installed package-provided table shape from `node_modules/connect-pg-simple/table.sql`: `sid`, `sess`, `expire`, primary key on `sid`, and index on `expire`.
- Update development seed coaches to store bcrypt-compatible password hashes.
- Keep existing coach seed emails and names unless implementation evidence shows duplicates or downstream seed references require id changes.
- Keep migration backward-compatible and reversible.

## API endpoints

- Existing endpoint affected: `POST /api/v1/coaches`.
- Registration creation should be allowed without an existing session.
- Registration creation should keep `requireTrustedOrigin`.
- Existing protected coach reads and updates should remain protected.
- Existing session endpoints stay under `/api/v1/sessions`.
- Optional implementation decision: successful registration may either return the created coach only or establish a session immediately; choose one contract and align tests/client behavior.

## Frontend components

- `RegisterForm` needs controlled input state or equivalent submit handling.
- `Register` should connect the form to a registration action or submit handler.
- `loginAction` may gain registration action creators/thunk if existing auth action organization remains the best local pattern.
- `loginReducer` may need registration loading/success/error state if registration is modeled with Redux.
- Register navigation links should use React Router routes rather than legacy `.html` hrefs if touched as part of submit flow.

## Implementation approach (safest path)

- Start with server contract and database support because the frontend depends on API behavior.
- Add the session table migration before changing runtime auth expectations.
- Make registration public only for create, not for list/profile/update routes.
- Preserve trusted-origin protection on registration to match existing mutating-route security.
- Reuse `Coach.hashPassword` for both runtime registration and seed hashing.
- Keep client API calls relative to `/api/v1/...`.
- Keep UI changes focused on making `/register` submit, report success/failure, and navigate predictably.
- Add tests at each boundary before relying on manual browser testing.

## Risks & edge cases

- Public registration can accidentally weaken protected coach profile/update routes if middleware changes are too broad.
- Duplicate email behavior is currently not clearly validated at the handler level.
- Seed order and foreign keys may depend on coach ids staying stable.
- Seed hashing with async bcrypt must be deterministic enough for seed execution while not committing real secrets.
- `CLIENT_ORIGIN` mismatch can make registration appear broken even when the API works.
- Session table migrations may conflict if a local developer manually created the table.
- Automatically logging in after registration can introduce session side effects that must be tested.
- Registration UI currently uses plain DOM ids and no submit handler, so tests should lock expected form behavior.

## Security concerns

- Do not return password hashes from registration responses.
- Keep `requireTrustedOrigin` on public registration.
- Validate required fields server-side; client validation is UX only.
- Treat duplicate email and malformed input as safe validation errors, not raw database errors.
- Preserve `httpOnly`, `sameSite`, and production `secure` cookie settings.
- Do not expose database or bcrypt errors in client-facing responses.

## Testing strategy

- Add migration-level confidence through Knex migration up/down coverage if the repo has an existing pattern; otherwise verify through integration setup and local migration command.
- Add `src/server.test.js` coverage for unauthenticated trusted-origin registration success.
- Add `src/server.test.js` coverage that untrusted registration is rejected.
- Add `src/server.test.js` coverage that registration validation rejects missing required fields.
- Add `src/server.test.js` coverage that created coach responses exclude password data.
- Add action/reducer tests if registration is modeled through Redux.
- Add register component/page tests for form input, submit dispatch/API behavior, success state, and error state.
- Run focused Jest tests first, then broader relevant tests.
- Run `npm run lint` because JS/JSX and route code will be touched.
- Run `npm run build` if UI code changes affect production serving.

## Assumptions and unresolved questions

- Assumption: The selected backlog item is exactly `- [ ] Fix local auth and registration dev flow`.
- Assumption: The feature slug is `fix_local_auth_registration_dev_flow`.
- Assumption: Local development should continue using PostgreSQL, not an embedded database.
- Assumption: Registration should create a coach account through `/api/v1/coaches`.
- Assumption: The `connect-pg-simple` table schema in the installed package is sufficient source of truth for the local migration.
- Unresolved question: Should successful registration automatically create a login session, or should it redirect/show success and require manual login?
- Unresolved question: Should duplicate coach email validation be added explicitly in this feature or left to existing database behavior?
- Unresolved question: Should registration state live in `loginReducer`, a new reducer slice, or local component state?

## Step-by-step plan

- [x] Add a reversible `connect-pg-simple` session table migration in `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_create_session_table>.js` matching the installed `node_modules/connect-pg-simple/table.sql` table and index shape.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_coaches.js` so seeded coach passwords are bcrypt-compatible while preserving existing seed account identities.
- [x] Adjust `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js` so `POST /api/v1/coaches` allows unauthenticated registration while retaining `requireTrustedOrigin`.
- [x] Harden `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js` registration response handling so successful creates do not expose password hashes and validation failures remain explicit.
- [x] Add focused registration API coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` for unauthenticated trusted-origin success, untrusted-origin rejection, missing-field validation, and password exclusion.
- [x] Add registration action coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js` after adding the smallest repo-aligned registration thunk or submit helper in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js`.
- [x] Add registration state coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js` after extending `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js` only if Redux state is used for registration loading/success/error.
- [x] Wire `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RegisterForm.js` to submit first name, last name, email, and password to the registration flow with visible success and error states.
- [x] Wire `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Register.js` to provide any needed dispatch/navigation behavior to `RegisterForm` while preserving the existing page shell.
- [x] Add or update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Register.test.js` and component tests as needed to cover form rendering, field entry, submit behavior, and success/error rendering.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/README.md` to document local session table migration expectations, seeded login behavior, and registration endpoint behavior.
- [x] Run focused tests for registration API, registration client behavior, login actions/reducer, and session behavior using the repo's Jest patterns.
- [x] Run `npm run lint` and `npm run build` to verify touched JS/JSX and production-serving behavior.
