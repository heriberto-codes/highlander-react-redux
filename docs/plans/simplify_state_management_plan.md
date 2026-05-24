# Plan: Simplify state management

Backlog item: `- [ ] Simplify state management`

Feature slug: `simplify_state_management`

## 1. Architecture grounding from `architecture.md`
- The client is a React 17 SPA in `src/` with page-level components in `src/pages/`, shared UI in `src/components/`, and routing in `src/container/App.js`.
- State management currently uses Redux in `src/store.js`, async thunk action creators in `src/actions/`, and reducers in `src/reducers/`.
- Forms still use `redux-form`, so this feature should not replace or remove the form reducer.
- The app is wrapped in a React Redux `Provider` in `src/index.js`, so function components can safely use React Redux hooks.
- API, database, session, authorization, and payload contracts are out of scope for this client state-management refactor.
- Existing routes and API URLs must remain unchanged.

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
- React Redux exposes `useSelector` for reading store state and `useDispatch` for dispatching actions from function components.
- React Redux hooks require the component tree to be wrapped in `<Provider store={store}>`, which this repo already does in `src/index.js`.

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/store.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/simplify_state_management.md`

## 4. Data / DB changes
None.

## 5. API endpoints
None.

## 6. Frontend components
- `App` should dispatch session bootstrap with `useDispatch` instead of a `connect` wrapper.
- `Login` should read login state with `useSelector` and dispatch login with `useDispatch`.
- `Dashboard` should read coach/login state with `useSelector` and dispatch profile actions with `useDispatch`.
- `TeamDetails` should read team state with `useSelector` and dispatch team actions with `useDispatch`.
- `redux-form` usage in `AddPlayerModal2` should remain unchanged.

## 7. Implementation approach
Keep the existing Redux store, action creators, thunks, reducer state shape, and `Provider`. Simplify page bindings by replacing `connect(mapStateToProps)` wrappers with React Redux hooks in the function components that were converted in the previous feature. Keep exported pure query-state helpers in `Dashboard` and `TeamDetails` for tests. For reducers, make only targeted cleanup that reduces state-management noise without changing state shape: remove unreachable `break` statements and unused imports/locals flagged by lint in reducer files when they are clearly dead code.

## 8. Risks & edge cases
- Hook selectors can cause rerenders if they return fresh objects every time; selectors should read individual stable state fields or use simple primitive/object references already stored in Redux.
- Converting page tests from direct prop injection to `Provider`-backed rendering can accidentally hide dispatch or selector regressions if mocks are too broad.
- `Dashboard` fetch behavior depends on `id`, active filters, pagination refs, and dispatch identity; hook migration must not create duplicate profile requests.
- `TeamDetails` route id handling must continue to use `useParams()` with the existing direct-render fallback only where tests require it.
- `Login` redirect behavior must continue to wait for resolved bootstrap state and avoid duplicate redirects.
- Removing dead reducer code must not alter reducer return values or initial state.

## 9. Security concerns
- This is a client state-binding refactor and should not change auth/session endpoints, trusted-origin checks, server-side authorization, cookies, or API payloads.
- Client-side route ids and roles must remain presentation/request inputs only; server-side authorization remains the security boundary.
- Login state must continue to come from session bootstrap/login actions rather than assuming auth from route access.

## 10. Testing strategy
- Update focused component/page tests to render hook-bound pages inside `Provider` with minimal test stores.
- Keep direct tests for exported pure helpers where they already validate filter/pagination query behavior.
- Preserve reducer tests for state shape and add focused assertions around any reducer cleanup if necessary.
- Run focused tests for changed files as steps are completed.
- Run `npm test -- --watchAll=false` after all implementation steps.
- Run `npm run lint` after tests pass to confirm dead-code cleanup and hook imports are correct.

## 11. Assumptions and unresolved questions
- Assumption: the selected backlog item is the first unchecked item in `docs/backlog.md`: `Simplify state management`.
- Assumption: simplifying state management means reducing `connect` / `mapStateToProps` wrapper boilerplate in function components, not replacing Redux, Redux Thunk, or Redux Form.
- Assumption: introducing Redux Toolkit would exceed the backlog item scope and conflict with the repo preference for small, reviewable diffs.
- Assumption: the previous feature's `connect` note in `architecture.md` should be updated only after hook migration is complete.
- Unresolved question: whether `redux-logger` should be development-only; this plan leaves middleware behavior unchanged unless a later step explicitly targets store configuration.

## 12. Step-by-step plan
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/store.js` only if needed to export test-friendly store primitives while preserving the default store, root reducer shape, thunk middleware, logger middleware, and `redux-form` reducer.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js` from `connect(null, { bootstrapSession })` to `useDispatch`, preserving one session bootstrap dispatch on mount.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js` to validate hook-based bootstrap and existing route behavior under `Provider`.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js` from `connect(mapStateToProps)` to `useSelector` and `useDispatch`, preserving bootstrap-gated rendering, login dispatch, error display, and dashboard redirects.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js` to validate Login through a `Provider`-backed hook render path.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` from `connect(mapStateToProps)` to `useSelector` and `useDispatch`, preserving profile fetch, local filter state, season changes, and pagination handlers.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js` to validate Dashboard behavior with Redux hook state while keeping exported helper coverage.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` from `connect(mapStateToProps)` to `useSelector` and `useDispatch`, preserving route id handling, profile fetch, filters, pagination, modal, game-entry, and collaborator actions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js` to validate TeamDetails behavior with Redux hook state and `MemoryRouter` route params while keeping exported helper coverage.
- [x] Clean reducer dead-code noise in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`, and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js` without changing state shape or action behavior.
- [x] Update reducer tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/loginReducer.test.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`, and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js` only if reducer cleanup changes exported helper visibility or test setup needs adjustment.
- [x] Search `/Users/hroman_codes/Documents/Code/highlander-react-redux/src` for remaining `connect(`, `mapStateToProps`, and stale reducer/action imports introduced by earlier connected components, and remove leftovers that are in scope.
- [x] Run `npm test -- --watchAll=false` to validate hook-based state bindings and reducer behavior.
- [x] Run `npm run lint` to verify imports, dead-code cleanup, and hook migration style.
- [x] Document the completed state-management simplification in `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/simplify_state_management.md` and update `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md` only if the final implementation changes documented client state-management guidance.
