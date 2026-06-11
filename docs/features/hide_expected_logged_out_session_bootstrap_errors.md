# Hide Expected Logged-Out Session Bootstrap Errors

## Summary
- Session bootstrap `401` and `403` responses now resolve as an expected logged-out state instead of a generic application failure.
- Expected logged-out users see the login form without a misleading error.
- Network errors, unexpected HTTP statuses, and failed login attempts remain visible.

## Architecture Impact
- Added `BOOTSTRAP_SESSION_LOGGED_OUT` to the existing Redux authentication flow.
- The logged-out reducer transition resolves session loading, disables redirect, and clears `errorMessage`.
- Server authentication, authorization, session handling, routes, and payload contracts were unchanged.

## Decisions
- Classify only bootstrap `401` and `403` responses as expected logged-out outcomes.
- Preserve `BOOTSTRAP_SESSION_FAIL` for missing-response network errors and other HTTP statuses.
- Keep login failures separate so invalid credentials continue to display an error.

## API Changes
- None.
- `GET /api/v1/sessions` remains credentialed and unchanged.

## Database Changes
- None.

## Test Impact
- Action tests cover bootstrap `401`, `403`, network-error, and unexpected-status dispatch behavior.
- Reducer tests cover the clean resolved logged-out state and retained generic failures.
- Login page tests cover expected logged-out rendering and visible bootstrap/login failures.
- Focused result: 3 suites passed, 32 tests passed.
- Full result: 39 suites passed, 444 tests passed.
- ESLint completed with 0 errors and 10 existing warnings.

## Deployment Notes
- No configuration, migration, or deployment changes are required.

## Follow-ups / Accepted Risks
- The client currently treats every bootstrap `403` as logged out because the existing missing-session middleware returns `403`.
- A future authorization or configuration failure using `403` could be hidden. A separate API-contract change should normalize missing sessions to `401` or add a stable machine-readable error code.
