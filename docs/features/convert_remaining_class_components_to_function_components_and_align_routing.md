# Convert remaining class components to function components and align routing

## Summary
- Converted the remaining client class components to function components.
- Replaced class lifecycle behavior with React hooks while preserving rendered markup, Redux action contracts, and existing route paths.
- Aligned route-dependent pages with React Router v6 hooks for navigation and route params.
- Updated focused page tests to validate rendered behavior and callback wiring instead of constructing class instances.
- Verified the completed conversion with the full Jest suite and ESLint.
- Marked the matching backlog item complete after plan completion and final review checks.

## Architecture Impact
- Client route-level pages and shared form components now use function components.
- Redux remains the state-management boundary; connected pages still use `connect` and existing thunk action creators.
- React Router v6 remains the routing layer in `src/container/App.js`.
- `Login` uses `useNavigate` for programmatic dashboard redirects.
- `TeamDetails` uses `useParams` for `/teamdetails/:id`, with a narrow `props.match.params.id` fallback retained for direct-render compatibility.
- `Dashboard` and `TeamDetails` keep local filter and pagination request state in hooks while dispatching the same existing profile actions.
- No server, API, database, payload, or route-path contracts changed.

## Decisions
- Preserved `connect` instead of introducing `useSelector` / `useDispatch` or a new state-management pattern.
- Converted components in small slices, from simple presentational components to higher-risk connected pages.
- Exported pure query-state helpers from `Dashboard` and `TeamDetails` so tests can validate filter and pagination behavior without class instances.
- Kept child component mocks in focused page tests to verify container wiring without expanding into full UI interaction coverage.
- Left existing lint warnings in place because `npm run lint` exits successfully and warning cleanup is outside this refactor.

## Components Updated
- `src/pages/Home.js`
- `src/pages/Register.js`
- `src/container/App.js`
- `src/pages/Login.js`
- `src/components/input.js`
- `src/components/AddPlayerModal2.js`
- `src/pages/Dashboard.js`
- `src/pages/TeamDetails.js`

## Test Impact
- Updated `src/container/App.test.js` for bootstrap and route rendering around the function `App`.
- Updated `src/pages/Login.test.js` for function-component rendering, login dispatch, and navigation behavior.
- Updated `src/pages/Dashboard.test.js` to exercise rendered `Dashboard` behavior through mocked child callbacks and exported helpers.
- Updated `src/pages/TeamDetails.test.js` to render under `MemoryRouter`, `Routes`, and `/teamdetails/:id` so `useParams` receives a real route id.

Verification completed:
- `npm test -- --watchAll=false`
  - Passed: 29 test suites, 376 tests.
  - The first sandboxed run failed only because `src/server.test.js` could not bind a local Supertest listener; the same command passed with escalated local listener permissions.
- `npm run lint`
  - Passed with exit code 0.
  - Reported 0 errors and 30 warnings.
- Security review:
  - No new authentication, authorization, API-boundary, secret-handling, or data-handling risks found.
- Performance review:
  - No material API, database, duplicate-fetch, or rendering regressions found.

## API Changes
- None.

## Database Changes
- None.

## Deployment Notes
- No deployment sequencing is required beyond the normal client/server deploy process.
- Existing React Router paths remain unchanged:
  - `/`
  - `/login`
  - `/register`
  - `/dashboard`
  - `/dashboard/:id`
  - `/teamdetails/:id`
- Runtime behavior still depends on the existing Redux store shape and thunk actions.

## Follow-ups / Accepted Risks
- Accepted risk:
  - focused page tests mock child components, so they prove page/container wiring but not every real child UI interaction.
- Accepted risk:
  - existing non-blocking lint warnings remain.
- Follow-up not included in this feature:
  - simplifying Redux state management
  - adding route protection and loading/error states
  - cleaning existing lint warnings
