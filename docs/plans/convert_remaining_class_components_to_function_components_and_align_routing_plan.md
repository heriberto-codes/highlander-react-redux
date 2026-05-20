# Plan: Convert the remaining class components to function components and align routing

Backlog item: `- [ ] Convert the remaining class components to function components and align routing`

Feature slug: `convert_remaining_class_components_to_function_components_and_align_routing`

## 1. Architecture grounding from `architecture.md`
- The client is a React 17 SPA in `src/` with route-level pages in `src/pages/`, shared components in `src/components/`, and routing defined in `src/container/App.js`.
- State management remains Redux with thunk-based async actions and `connect`-based bindings already present in page containers.
- API and database contracts are out of scope for this client-only refactor.
- Existing routes use `react-router-dom` v6 with `<Routes>` and `<Route element={...}>`, so route params and navigation should be aligned through React Router hooks in function component wrappers or connected function components.
- The repository prefers existing patterns and small reviewable diffs; this plan should not introduce a new routing architecture, new state library, or broad component redesign.

## 2. Tech stack detected from `architecture.md` and confirmed against repo
- React 17.0.2
- React DOM 17.0.2
- React Router DOM 6.22.3
- Redux 4.2.1
- React Redux 8.1.1
- Redux Thunk 2.4.2
- Redux Form 8.3.10
- Jest through `react-scripts test`
- Bulma styling through existing class names

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Home.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Register.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/input.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/AddPlayerModal2.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/convert_remaining_class_components_to_function_components_and_align_routing.md`

## 4. Data / DB changes
None.

## 5. API endpoints
None.

## 6. Frontend components
- Convert simple presentational page classes first: `Home` and `Register`.
- Convert the app shell in `App.js` from `componentDidMount` to `useEffect` while preserving one bootstrap dispatch on mount.
- Convert `Login` to a function component using `useNavigate` directly instead of a class plus wrapper.
- Convert `Dashboard` to a function component with `useState`, `useEffect`, and existing Redux dispatch props.
- Convert `TeamDetails` to a function component using `useParams` for `:id`, with route-param compatibility kept only where tests still render the exported component directly.
- Convert `Input` to a function component with `useRef` and `useEffect` for focus behavior.
- Convert `AddPlayerModal2` to a function component while preserving the existing redux-form wrapper.

## 7. Implementation approach
Use React hooks to mirror the current class lifecycle behavior without changing UI output or Redux action contracts. Keep `connect` in place for connected containers to minimize state-management changes, and only use React Router hooks where routing data is currently class-prop or wrapper driven. Convert components in small batches from simplest to highest risk, updating tests alongside the component shape where direct `new Component(...)` tests currently depend on class instances.

Context7 documentation checked:
- React 17 supports hooks such as `useState`, `useEffect`, and `useRef`; `useEffect` dependencies should explicitly represent mount/update behavior.
- React Router v6 exposes route params and programmatic navigation through hooks such as `useParams` and `useNavigate`; routes already use the v6 `element` API.

## 8. Risks & edge cases
- `Dashboard.test.js` and `TeamDetails.test.js` instantiate classes directly, so those tests must move to rendered interactions or exported pure helpers before the components can become functions.
- `Dashboard` and `TeamDetails` sync local filter state from Redux props only when filter values change; hook dependencies must preserve unsaved local edits.
- `TeamDetails` currently expects `props.match.params.id`, which is not a native React Router v6 prop; converting to `useParams` should fix route alignment without breaking direct test render paths.
- `Login` uses delayed navigation after bootstrap; hook conversion must avoid duplicate navigation on rerenders.
- `Input` focuses when redux-form meta active changes from false to true; the function version must preserve that transition behavior.
- `AddPlayerModal2` contains legacy typos and unused validation code; conversion should preserve behavior rather than refactor form semantics in this feature.

## 9. Security concerns
This is a client-only refactor and should not change authentication, authorization, trusted-origin checks, API URLs, or data payloads. Login navigation must continue to rely on existing session bootstrap state rather than assuming authentication from route access alone.

## 10. Testing strategy
- Update focused component/page tests as each class is converted.
- Prefer rendered behavior tests with `ReactDOM.render`, `Provider`, and `MemoryRouter` over direct class instantiation once components are functions.
- Keep existing mocked action assertions for `getProfile`, `getTeamProfile`, login, collaboration actions, game-entry submission, and bootstrap dispatch.
- Add or adjust routing tests so `/dashboard/:id` and `/teamdetails/:id` supply route params through React Router v6 instead of manual `match` props.
- Run `npm test -- --watchAll=false` after the conversion steps.
- Run `npm run lint` after tests pass.

## 11. Assumptions and unresolved questions
- Assumption: the selected backlog item is the first unchecked item in `docs/backlog.md` because the skill invocation left `selected_backlog_item` and `feature_slug` as placeholders.
- Assumption: preserving `connect` is acceptable; simplifying Redux state management is a separate backlog item and should not be included here.
- Assumption: there is no requirement to upgrade React or React Router as part of this refactor.
- Assumption: `TeamDetails` should use React Router v6 hooks for real route params, with any compatibility prop only for narrow test support if needed during migration.
- Unresolved question: whether `AddPlayerModal2` is still a supported UI path or legacy modal code; the plan keeps it in scope because it is imported by `TeamDetails`.
- Unresolved question: whether final documentation should update only a feature doc or also add a short client architecture note to `architecture.md` after all class components are gone.

## 12. Step-by-step plan
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Home.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Register.js` from class components to function components without changing rendered markup.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.js` to a function component using `useEffect` for session bootstrap while preserving existing route definitions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/container/App.test.js` to validate bootstrap and routing behavior against the function App shape.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.js` to a connected function component using `useNavigate` directly and preserving bootstrap-gated rendering and dashboard redirects.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Login.test.js` to cover login rendering, dispatch, and navigation behavior for the function Login component.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/input.js` to a function component using `useRef` and `useEffect` for redux-form focus behavior.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/AddPlayerModal2.js` to a function component while preserving the existing `reduxForm({ form: 'addPlayer' })` export.
- [x] Extract pure dashboard query-state helpers from `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` if needed so existing class-instance behavior tests can be replaced without changing page behavior.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` to a connected function component with `useState` and `useEffect`, preserving profile fetch, filter sync, season changes, and pagination handlers.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js` to validate Dashboard behavior through rendered output, mocked child callbacks, and exported helpers instead of direct class instantiation.
- [x] Extract pure team-detail query-state helpers from `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` if needed so existing class-instance behavior tests can be replaced without changing page behavior.
- [x] Convert `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` to a connected function component using React Router v6 `useParams` for `:id`, preserving modal, game-entry, collaboration, filter, season, and pagination behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js` to provide route params through `MemoryRouter` and `Routes`, and to validate TeamDetails behavior through rendered callbacks and mocked actions.
- [x] Search `/Users/hroman_codes/Documents/Code/highlander-react-redux/src` for remaining `extends Component`, `extends React.Component`, `componentDidMount`, and `componentDidUpdate` usage and remove any leftover class-only imports introduced by the conversion.
- [x] Run `npm test -- --watchAll=false` to validate the converted component and routing behavior.
- [x] Run `npm run lint` to verify repository style after the conversion.
- [x] Document the completed client conversion and routing alignment in `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/convert_remaining_class_components_to_function_components_and_align_routing.md` and update `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md` only if the final implementation changes documented client architecture.
