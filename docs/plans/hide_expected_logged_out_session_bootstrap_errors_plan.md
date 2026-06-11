# Plan: Hide expected logged-out session bootstrap errors

Backlog item: `- [ ] Hide expected logged-out session bootstrap errors`

Feature slug: `hide_expected_logged_out_session_bootstrap_errors`

## 1. Architecture grounding from `architecture.md`
- Highlander is an Express 4 and React 17 monolith with a Redux/Redux Thunk client and session-backed authentication.
- The client bootstraps authentication through `GET /api/v1/sessions`; `src/container/App.js` dispatches the request once on mount.
- `loginReducer.hasResolvedSession` distinguishes unresolved startup state from a resolved logged-out state, and `ProtectedRoute` uses that state for loading and redirects.
- The server remains the authentication boundary. This feature should change only client interpretation and presentation of bootstrap responses, not session or authorization behavior.
- The documented bootstrap contract treats no valid session as `401`. The current `ensureAuthenticated` implementation returns `403` when the session is absent, while a stale coach session returns `401`. Implementation must account for this repository conflict without broadening the feature into an API contract migration.

## 2. Tech stack detected from `architecture.md` and confirmed against repo
- React 17.0.2
- React Router DOM 6.22.3
- Redux 4.2.1 with React Redux 8.1.1 and Redux Thunk 2.4.2
- Axios 1.15.0
- Express 4.18.2 with `express-session`
- Jest through `react-scripts test`
- ESLint through `npm run lint`

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js`

## 4. Data / DB changes
None.

## 5. API endpoints
- No endpoint or server response changes.
- Continue calling `GET /api/v1/sessions` with `withCredentials: true`.
- Treat the existing unauthenticated statuses returned by the bootstrap path (`401` for a stale session and `403` for no session) as an expected resolved logged-out result on the client.
- Preserve genuine network failures and unexpected HTTP statuses as visible bootstrap errors.

## 6. Frontend components
- No new components.
- `Login` should continue rendering the login form after bootstrap resolves logged out.
- Existing `Login` error rendering should receive `null` for expected logged-out bootstrap responses and retain an error for unexpected bootstrap failures or failed login attempts.
- `ProtectedRoute` behavior remains unchanged because expected logged-out bootstrap responses must still set `hasResolvedSession: true`.

## 7. Implementation approach
- Add an explicit bootstrap logged-out action rather than reusing the generic bootstrap failure action for expected unauthenticated responses.
- Classify only Axios responses with status `401` or `403` as expected logged-out bootstrap results.
- Dispatch the existing bootstrap failure action for missing-response network errors and all other statuses.
- Extend `loginReducer` so the logged-out action resolves loading and session state without populating `errorMessage`.
- Keep `LOGIN_FAIL` unchanged so invalid credentials remain visible to the user.
- Do not change `GET /api/v1/sessions`, `ensureAuthenticated`, route guards, redirects, or API payloads.

## 8. Risks & edge cases
- Treating every bootstrap rejection as expected would hide outages and server regressions; classification must be status-specific.
- Treating `403` as expected is necessary for current repository behavior, but it also reflects a contract mismatch with `architecture.md`.
- A stale session must still resolve logged out after the server returns `401`.
- Network failures and `5xx` responses must leave the login form available after resolution while showing a useful error.
- Login request failures must not be suppressed by bootstrap-specific handling.
- Axios error objects may omit `response`; status access must be guarded.

## 9. Security concerns
- Do not weaken server authentication or authorization checks.
- Do not infer authentication from client state beyond the existing bootstrap contract.
- Preserve credentialed Axios requests.
- Do not display raw server internals; retain the existing safe error rendering boundary.

## 10. Testing strategy
- Add action tests proving `401` and `403` bootstrap responses dispatch the logged-out action.
- Add action tests proving network and unexpected server failures still dispatch `BOOTSTRAP_SESSION_FAIL`.
- Add reducer tests proving the logged-out action resolves the session without setting `errorMessage`.
- Preserve reducer coverage proving generic bootstrap failures remain visible.
- Update the login page test to verify expected logged-out bootstrap completion renders the form without an error.
- Preserve login failure coverage so invalid credentials remain visible.
- Run focused Jest tests for the action, reducer, and login page files.
- Run the complete non-watch Jest suite and ESLint.

## 11. Assumptions and unresolved questions
- Assumption: “hide” means suppress expected logged-out errors in application UI/state; browser developer tools will still record the HTTP response.
- Assumption: both `401` and `403` must be recognized because both currently represent unauthenticated bootstrap outcomes in this repository.
- Assumption: changing the server's missing-session response from `403` to `401` is outside this backlog item's scope.
- Unresolved question: the architecture contract and current middleware disagree on the missing-session status. A separate API-contract task should normalize that behavior if strict `401` semantics are required.

## 12. Step-by-step plan
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.js` with a bootstrap logged-out action and status-specific classification for `401` and `403` responses while preserving generic failure dispatches.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js` to cover `401`, `403`, network-error, and unexpected-status bootstrap dispatch behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js` so the bootstrap logged-out action resolves authentication as logged out with no `errorMessage`.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js` to cover the error-free logged-out transition and preserve generic bootstrap failure behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js` to verify expected logged-out bootstrap completion renders the login form without an error while unexpected failures and login failures remain visible.
- [x] Search `/Users/hroman_codes/Documents/Code/highlander-react-redux/src` for bootstrap failure consumers that assume every unauthenticated response populates `errorMessage`.
- [x] Run focused Jest tests for `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/loginAction.test.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`, and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js`.
- [x] Run `npm test -- --watchAll=false` and `npm run lint`.
