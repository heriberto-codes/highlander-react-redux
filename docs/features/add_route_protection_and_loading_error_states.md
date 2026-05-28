# Add route protection and loading/error states

## Summary
- Added client-side route protection for authenticated dashboard and team-detail routes.
- Preserved attempted protected routes through login when a logged-out user is redirected.
- Added explicit loading and safe error UI for coach profile and team profile requests.
- Extended reducer state so profile request progress and failures are represented in Redux.
- Verified the completed feature with focused tests, the full Jest suite, and ESLint.
- Marked the matching backlog item complete after all plan steps passed.

## Architecture Impact
- React Router remains the client routing layer in `src/container/App.js`.
- `ProtectedRoute` wraps `/dashboard`, `/dashboard/:id`, and `/teamdetails/:id`.
- `/`, `/login`, and `/register` remain public routes.
- Client route protection is a UX guard only. Server-side authentication and authorization remain the security boundary.
- Login redirects are derived from React Router `location.state.from`, sanitized to internal pathnames, and fall back to `/dashboard`.
- Redux remains the state boundary for auth, coach profile, and team profile request state.
- No server, API, database, session cookie, payload, or route-path contracts changed.

## Decisions
- Added route protection at the route-element level instead of introducing a new routing architecture.
- Reused the existing session bootstrap state:
  - `loginReducer.hasResolvedSession`
  - `loginReducer.isloggedIn`
  - `loginReducer.isLoading`
- Kept the login redirect target internal and state-based instead of accepting query-string or external redirect URLs.
- Added coach profile loading/error fields to `coachReducer`:
  - `isLoadingProfile`
  - `profileError`
- Added team profile loading state to `teamReducer`:
  - `isLoadingTeamProfile`
  - existing `errorMessage` continues to hold team profile failures.
- Rendered generic profile error messages instead of raw Axios/server error objects.

## Components Updated
- `src/components/ProtectedRoute.js`
- `src/container/App.js`
- `src/pages/Login.js`
- `src/pages/Dashboard.js`
- `src/pages/TeamDetails.js`
- `src/reducers/coachReducer.js`
- `src/reducers/teamReducer.js`

## User-Facing Behavior
- Logged-out users visiting `/dashboard`, `/dashboard/:id`, or `/teamdetails/:id` are sent to `/login` after session bootstrap resolves.
- While session bootstrap is unresolved or loading, protected routes and login render `Loading...` instead of redirecting prematurely.
- After authentication, login returns users to the attempted protected route when present.
- If no safe attempted route exists, login redirects to `/dashboard`.
- Dashboard shows:
  - `Loading profile...` while the coach profile request is loading
  - `Unable to load profile. Please try again.` when the request fails
- Team Details shows:
  - `Loading team profile...` while the team profile request is loading
  - `Unable to load team profile. Please try again.` when the request fails

## Test Impact
- Added `src/components/ProtectedRoute.test.js` coverage for unresolved bootstrap, loading, authenticated render, and logged-out redirect behavior.
- Updated `src/container/App.test.js` to cover protected route rendering and redirect behavior under Provider-backed auth state.
- Updated `src/pages/Login.test.js` for bootstrap loading, default dashboard redirects, and preserved-route redirects.
- Updated `src/reducers/coachReducer.test.js` for coach profile loading/error lifecycle.
- Updated `src/pages/Dashboard.test.js` for loading and safe error UI while preserving fetch/filter/season/pagination behavior.
- Updated `src/reducers/teamReducer.test.js` for team profile loading/error lifecycle.
- Updated `src/pages/TeamDetails.test.js` for loading and safe error UI while preserving route id, filters, pagination, modal, game-entry, and collaborator behavior.

Verification completed:
- Focused Jest:
  - Passed: 7 test suites, 93 tests.
- Full Jest:
  - Passed: 31 test suites, 397 tests.
  - The sandboxed run failed only because `src/server.test.js` could not bind a local Supertest listener; the same command passed with escalated local listener permissions.
- ESLint:
  - Passed with exit code 0.
  - Reported 0 errors and 12 warnings.
- Security review:
  - No blocking security issues found.
  - Confirmed client route protection remains a UX guard and server authorization remains required.
- Performance review:
  - No material performance risks found.
  - No API, database, or query path changes were introduced.

## API Changes
- None.

## Database Changes
- None.

## Deployment Notes
- No migrations, environment variable changes, or deployment sequencing are required.
- Existing route paths remain unchanged:
  - `/`
  - `/login`
  - `/register`
  - `/dashboard`
  - `/dashboard/:id`
  - `/teamdetails/:id`
- Runtime behavior depends on session bootstrap resolving `loginReducer.hasResolvedSession` correctly.

## Follow-ups / Accepted Risks
- Accepted risk:
  - client route protection is bypassable and remains only a UX guard; server authorization must continue protecting API data.
- Accepted risk:
  - documentation and architecture notes can drift if future protected routes, reducer fields, or login/error behavior change without updates.
- Accepted risk:
  - if loading and error flags are both truthy, Dashboard or Team Details can render both notices.
- Accepted risk:
  - existing non-blocking lint warnings remain, including unused variables/imports and `no-case-declarations` warnings in `coachReducer`.
- Follow-up not included in this feature:
  - cleaning existing lint warnings
  - suppressing or opting into React Router future flags
  - adding a broader design system for loading/error presentation
