# Plan: Add route protection and loading/error states

Backlog item: `- [ ] Add route protection and loading/error states`

Feature slug: `add_route_protection_and_loading_error_states`

## 1. Architecture grounding from `architecture.md`
- The client is a React 17 SPA in `src/` with route-level pages in `src/pages/` and routing in `src/container/App.js`.
- Routing uses `react-router-dom` v6, with route elements declared in `src/container/App.js`.
- Client state uses Redux in `src/store.js`; route-level function pages read state with `useSelector` and dispatch thunks with `useDispatch`.
- Authentication is session-backed on the server. The client rehydrates auth state through `GET /api/v1/sessions` via `bootstrapSession`.
- Server-side `ensureAuthenticated`, trusted-origin checks, and authorization remain the security boundary; client route protection is a UX guard only.
- API, database, session cookie, and payload contracts should remain unchanged.

## 2. Tech stack detected from `architecture.md` and confirmed against repo
- React 17.0.2
- React DOM 17.0.2
- React Router DOM 6.22.3
- Redux 4.2.1
- React Redux 8.1.1
- Redux Thunk 2.4.2
- Redux Form 8.3.10
- Jest through `react-scripts test`
- ESLint through `npm run lint`

Context7 documentation checked:
- React Router v6 uses `<Navigate>` for declarative redirects and supports `replace` plus `state`.
- React Redux supports reading store state with `useSelector` and dispatching existing action creators or thunks with `useDispatch`.

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ProtectedRoute.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ProtectedRoute.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/add_route_protection_and_loading_error_states.md`

## 4. Data / DB changes
None.

## 5. API endpoints
None.

## 6. Frontend components
- Add a small `ProtectedRoute` component that reads `loginReducer.hasResolvedSession`, `loginReducer.isloggedIn`, `loginReducer.isLoading`, and `loginReducer.errorMessage`.
- Wrap `/dashboard`, `/dashboard/:id`, and `/teamdetails/:id` routes with `ProtectedRoute`.
- Keep `/`, `/login`, and `/register` public.
- Update `Login` to show an explicit bootstrap/loading state and redirect authenticated users to the preserved attempted route when available, falling back to `/dashboard`.
- Update `Dashboard` to show profile loading and profile error states from `coachReducer`.
- Update `TeamDetails` to show team-profile loading and error states from `teamReducer`.

## 7. Implementation approach
Use the existing Redux/session model. Add route protection at the route-element level in `App` rather than creating a new router architecture. `ProtectedRoute` should render a small loading message while bootstrap is unresolved, render `<Navigate to="/login" replace state={{ from: location }} />` when the session has resolved logged out, and render children when authenticated.

For loading/error states, extend existing reducers with minimal flags:
- `coachReducer`: add profile request loading and error fields around `GET_PROFILE`, `PROFILE_SUCCESS`, and `PROFILE_ERROR`.
- `teamReducer`: add team profile request loading around `GET_TEAM_PROFILE`, `GET_TEAM_PROFILE_SUCCESS`, and `GET_TEAM_PROFILE_ERROR`, using the existing `errorMessage` field for profile errors.

Keep existing action creators, API URLs, payloads, reducer keys, and page fetch behavior unchanged. Use simple inline page messages or existing Bulma notification classes; do not introduce a design system or new styling framework.

## 8. Risks & edge cases
- Route guards must not redirect before session bootstrap resolves, or direct visits to protected routes will flicker to login incorrectly.
- Login redirect state must be derived from React Router location state, not query strings or external URLs.
- Protected route tests must cover authenticated, unauthenticated, and unresolved-bootstrap states.
- Dashboard and TeamDetails should not dispatch duplicate fetches while adding loading/error rendering.
- Page errors can contain Axios error objects; UI should display a safe, short message and avoid rendering raw objects.
- Server authorization remains required because client guards can be bypassed.

## 9. Security concerns
- Client route protection is not an authorization boundary. Server `ensureAuthenticated` and resource authorization must remain unchanged.
- Redirect targets should be internal route locations from React Router state only; do not accept arbitrary external redirect URLs.
- Do not expose API error internals, stack traces, secrets, or raw response objects in UI messages.
- Preserve `withCredentials: true` on existing session/profile/team API calls.

## 10. Testing strategy
- Add focused tests for `ProtectedRoute` authenticated, unauthenticated, and unresolved-bootstrap behavior.
- Update `App.test.js` to verify protected routes render only when auth state is resolved and authenticated, and redirect to login when resolved logged out.
- Update `Login.test.js` to verify bootstrap loading UI and redirect to preserved internal route state after authentication.
- Update reducer tests for new loading/error state fields in `coachReducer` and `teamReducer`.
- Update `Dashboard.test.js` and `TeamDetails.test.js` to verify loading and error UI without changing fetch behavior.
- Run focused tests for modified files during implementation.
- Run `npm test -- --watchAll=false` after implementation.
- Run `npm run lint` after tests pass.

## 11. Assumptions and unresolved questions
- Assumption: the selected backlog item is the next unchecked item in `docs/backlog.md`: `Add route protection and loading/error states`.
- Assumption: route protection means client-side UX protection for protected pages, not new server middleware.
- Assumption: the initial protected routes are dashboard and team details because they read authenticated coach/team data.
- Assumption: loading/error states should be lightweight page states, not a new design-system effort.
- Assumption: preserving the attempted protected route after login is in scope because React Router supports it through location state and it improves the route-protection flow.
- Unresolved question: whether `/register` should redirect away when already authenticated; this plan leaves it public unless implementation evidence shows an existing expected behavior.

## 12. Step-by-step plan
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ProtectedRoute.js` to gate child route elements using existing login reducer fields and React Router `<Navigate>`.
- [x] Add `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ProtectedRoute.test.js` for unresolved bootstrap, authenticated render, and logged-out redirect behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js` to wrap `/dashboard`, `/dashboard/:id`, and `/teamdetails/:id` with `ProtectedRoute` while preserving public routes and session bootstrap.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js` to cover protected route rendering and redirect behavior under Provider-backed auth states.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js` to render an explicit bootstrap/loading state and redirect authenticated users to the preserved internal route state or `/dashboard`.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js` to cover login loading state and preserved-route redirect behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js` with profile loading/error state for `GET_PROFILE`, `PROFILE_SUCCESS`, and `PROFILE_ERROR`.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js` for profile loading/error state without changing existing profile data behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` to render profile loading and safe profile error messages while preserving existing profile fetch, filter, season, and pagination behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js` to cover dashboard loading/error UI and confirm existing fetch behavior still works.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js` with team-profile loading state around `GET_TEAM_PROFILE`, `GET_TEAM_PROFILE_SUCCESS`, and `GET_TEAM_PROFILE_ERROR`.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js` for team-profile loading/error state without changing existing team profile behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` to render team-profile loading and safe error messages while preserving route id, profile fetch, filters, pagination, modal, game-entry, and collaborator behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js` to cover team details loading/error UI and confirm existing dispatch behavior still works.
- [x] Search `/Users/hroman_codes/Documents/Code/highlander-react-redux/src` for stale unprotected protected-route paths, unsafe redirect targets, and raw error-object rendering introduced by this feature.
- [x] Run focused Jest tests for the changed route, login, reducer, dashboard, and team details files.
- [x] Run `npm test -- --watchAll=false` to validate the complete app test suite.
- [x] Run `npm run lint` to verify route guard imports, hook usage, and reducer changes.
- [x] Document the completed route protection and loading/error states in `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/add_route_protection_and_loading_error_states.md` and update `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md` only if final client routing guidance changes.
