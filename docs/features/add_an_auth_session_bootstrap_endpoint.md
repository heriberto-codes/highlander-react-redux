# Add an auth/session bootstrap endpoint

## Architecture overview
- The app already used cookie-backed session auth for coach login/logout, but client auth state lived only in Redux memory.
- The implemented feature adds a small read-only bootstrap endpoint and wires client startup to rehydrate auth state after refresh.
- Flow:
  - browser mounts app
  - `App` dispatches `bootstrapSession()`
  - client requests `GET /sessions` with credentials
  - server reads `req.session.coachId`
  - server returns minimal coach identity or `401`
  - reducer resolves auth state
  - `Login` waits for session resolution before rendering the form and redirects when already authenticated

## Architectural decisions made
- Reused existing `/sessions` route namespace instead of adding a parallel `/auth` namespace.
- Kept the endpoint read-only and minimal.
- Returned only bootstrap identity fields:
  - `id`
  - `email`
  - `first_name`
  - `last_name`
- Reused the existing login reducer instead of introducing a second auth store.
- Added `hasResolvedSession` so the client can distinguish unresolved startup state from resolved logged-out state.
- Kept login-page behavior explicit in the page layer instead of adding broader route-guard infrastructure in this step.

## API endpoints
- `POST /sessions/login`
  - existing login endpoint
- `GET /sessions`
  - purpose: bootstrap current authenticated session
  - auth source: `req.session.coachId`
  - success response: minimal coach identity payload
  - failure response: `401`
  - stale-session behavior: destroys invalid session if the referenced coach no longer exists
- `DELETE /sessions`
  - existing logout endpoint

Example success response:

```json
{
  "id": 10,
  "email": "coach@example.com",
  "first_name": "Test",
  "last_name": "Coach"
}
```

## Database changes
- None
- The feature reuses the existing session store and `coaches` table.

## Example usage
- Client bootstrap thunk:

```js
dispatch(bootstrapSession());
```

- Server request:

```http
GET /sessions
Cookie: connect.sid=...
```

- Login page behavior:
  - if session bootstrap is unresolved, do not render the login form yet
  - if bootstrap resolves authenticated, redirect to `/dashboard`
  - if bootstrap resolves logged out, render the login form

## Deployment considerations
- Requires the existing session configuration to work correctly:
  - `DATABASE_URL`
  - `CLIENT_ORIGIN`
  - `SECRET`
- Client requests must continue sending credentials.
- Because the endpoint is read-only, it does not need trusted-origin mutation protection.
- Reverse proxy / cookie settings must preserve the session cookie across refreshes for bootstrap to succeed.

## Test coverage
- Backend route coverage:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- Action coverage:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`
- Reducer coverage:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`
- App startup coverage:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js`
- Login page coverage:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js`

## Current limitations
- API origins are still hardcoded in client actions.
- Auth bootstrap is integrated only with app startup and the login page; broader route-protection improvements remain future work.
