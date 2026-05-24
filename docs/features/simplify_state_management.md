# Simplify state management

## Summary
- Replaced remaining page-level `connect` / `mapStateToProps` Redux bindings with React Redux hooks.
- Preserved the existing Redux store, reducer shape, thunk action creators, `redux-form` reducer, routes, and API contracts.
- Added test-friendly store exports so Provider-backed tests can use the real root reducer shape.
- Updated page tests to render hook-bound components under `Provider` instead of injecting connected props.
- Removed stale connected-component leftovers and reducer dead-code noise that did not affect runtime behavior.
- Verified the completed state-management simplification with the full Jest suite and ESLint.
- Marked the `Simplify state management` backlog item complete after the plan, verification, checkpoint, test, security, and performance review gates finished.

## Architecture Impact
- Redux remains the client state-management boundary in `src/store.js`.
- Route-level pages now read Redux state with `useSelector` and dispatch actions with `useDispatch`.
- `src/index.js` still supplies the app-wide React Redux `Provider`.
- `App`, `Login`, `Dashboard`, and `TeamDetails` now export hook-based function components directly instead of connected wrapper exports.
- `Dashboard` and `TeamDetails` retain exported pure query-state helpers for focused tests.
- `redux-form` usage in `AddPlayerModal2` remains unchanged.
- No server, API, database, auth/session, payload, or route-path contracts changed.

## Decisions
- Kept Redux and Redux Thunk rather than introducing Redux Toolkit or a different state-management library.
- Used individual `useSelector` calls for existing reducer fields to preserve state shape and avoid fresh selector objects.
- Kept local filter, pagination, redirect, route-param, modal, and game-entry behavior in the existing hook effects and handlers.
- Exported `rootReducer` and `createAppStore(preloadedState)` from `src/store.js` for tests while preserving the default singleton store export.
- Left `redux-logger` middleware behavior unchanged.
- Limited reducer cleanup to clearly unreachable `break` statements and unused imports/locals.
- Left existing non-blocking lint warnings in place because warning cleanup is outside this feature.

## Components Updated
- `src/container/App.js`
- `src/pages/Login.js`
- `src/pages/Dashboard.js`
- `src/pages/TeamDetails.js`
- `src/store.js`
- `src/reducers/loginReducer.js`
- `src/reducers/coachReducer.js`

## Test Impact
- Added `src/store.test.js` coverage for the exported root reducer shape and `createAppStore(preloadedState)`.
- Updated `src/container/App.test.js` to render `App` under `Provider` and validate bootstrap dispatch and route behavior.
- Updated `src/pages/Login.test.js` to render `Login` under `Provider` and validate bootstrap-gated rendering, error display, login dispatch, and redirects.
- Updated `src/pages/Dashboard.test.js` to render `Dashboard` under `Provider` and validate profile fetches, filters, season changes, pagination, state sync, child props, and exported helpers.
- Updated `src/pages/TeamDetails.test.js` to render `TeamDetails` under `Provider` plus `MemoryRouter`/`Routes`, validating route params, profile fetches, filters, pagination, modal/game-entry behavior, collaboration actions, child props, and exported helpers.
- Existing reducer tests still cover unchanged reducer behavior; no reducer test changes were needed for the dead-code cleanup.

Verification completed:
- `npm test -- --watchAll=false`
  - Passed: 30 test suites, 378 tests.
  - The first sandboxed run failed only because `src/server.test.js` could not bind a local Supertest listener; the same command passed with escalated local listener permissions.
- `npm run lint`
  - Passed with exit code 0.
  - Reported 0 errors and 12 warnings.

## API Changes
- None.

## Database Changes
- None.

## Deployment Notes
- No migrations, environment variable changes, or deployment sequencing are required.
- Runtime behavior still depends on the existing Redux reducer keys:
  - `loginReducer`
  - `coachReducer`
  - `teamReducer`
  - `form`
- Security and performance reviews found no API, database, auth/session, route, payload, or server-boundary changes in this feature.

## Follow-ups / Accepted Risks
- Accepted risk:
  - focused page tests use minimal test stores and mocked child components, so they prove hook wiring and callback behavior but not every full child UI interaction.
- Accepted risk:
  - `createAppStore(preloadedState)` includes the existing `redux-logger` middleware, so tests using it can produce console noise and production stores still log all Redux actions.
- Accepted risk:
  - existing login actions still dispatch the raw `pwd` field and the unchanged logger middleware can log it; this was identified during security review as an existing data-handling risk preserved by the feature.
- Accepted risk:
  - existing non-blocking lint warnings remain, including unused variables/imports and `no-case-declarations` warnings in `coachReducer`.
- Follow-up not included in this feature:
  - making `redux-logger` development-only and avoiding raw password values in Redux actions
  - introducing Redux Toolkit
  - removing Redux Form
  - broad lint warning cleanup
