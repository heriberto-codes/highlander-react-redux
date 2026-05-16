# Plan: Add pagination and query capabilities

Backlog item: `- [ ] Add pagination and query capabilities`

Feature slug: `add_pagination_and_query_capabilities`

## 1. Architecture grounding from `architecture.md`
- Backend is an Express 4 monolith with REST-style JSON routes mounted under `/api/v1`.
- Route files in `api/routes/` delegate to domain handlers in `api/handlers/`.
- Business logic stays close to handlers and shared utilities in `api/utils/`; no new service layer should be introduced.
- Data access uses PostgreSQL through Bookshelf/Knex.
- Authentication is session-based, with `ensureAuthenticated` guarding protected reads.
- Client is a React 17 SPA with route-level pages in `src/pages/`, shared components in `src/components/`, Redux state in `src/store.js`, and thunk-based Axios actions.
- Existing query behavior already supports season/search/position filters for coach dashboard and team detail payloads.
- API changes should be additive and preserve current payload shapes, including `availableSeasons`, `activeSeason`, `derivedStats`, collaboration metadata, and notification fields.

## 2. Tech stack detected from `architecture.md` and confirmed against repo
- Backend: Node.js, Express, body-parser, cors, helmet, morgan.
- Auth/session: express-session, connect-pg-simple, bcrypt.
- Data: PostgreSQL, Knex, Bookshelf.
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk, redux-form.
- HTTP/UI: axios, Bulma.
- Tests: Jest via react-scripts and supertest.

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/filterQuery.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/queryParams.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.test.js`

## 4. Data / DB changes
None for this iteration.

The safest path is response-level pagination after existing authorization, season filtering, search filtering, derived-stat calculation, and collaboration metadata construction. This avoids schema changes and preserves current Bookshelf relationship loading. If datasets grow enough to require database-level pagination, that should be planned separately because the current handlers build nested coach/team/player payloads in memory.

## 5. API endpoints
Extend existing protected read endpoints only.

- `GET /api/v1/coaches/:id`
  - Keep existing optional query params: `season`, `teamSearch`, `playerSearch`, `position`.
  - Add optional query params: `teamPage`, `teamLimit`, `playerPage`, `playerLimit`, `notificationLimit`.
  - Add metadata fields: `teamPagination`, `playerPagination`, `notificationPagination`.
- `GET /api/v1/teams/:id`
  - Keep existing optional query params: `season`, `playerSearch`, `position`.
  - Add optional query params: `playerPage`, `playerLimit`.
  - Add metadata field: `playerPagination`.

Pagination contract:
- Missing page values default to `1`.
- Missing limit values default to a conservative value chosen in `api/utils/filterQuery.js`.
- Page and limit must be positive integers.
- Limits must be capped to a shared maximum.
- Pagination applies after existing authorization and filters.
- Existing arrays remain arrays at their current keys; metadata is additive.
- Empty pages return `200` with empty arrays and metadata, not `404`.

## 6. Frontend components
Primary controls:
- Dashboard pagination for teams, roster players, stats players, and notification count display if surfaced later.
- Team details pagination for roster/player stat entry views.

Components should use simple Bulma-compatible controls, preserve the existing class-component pages, and avoid converting components to function components as part of this feature.

## 7. Implementation approach
Add reusable pagination parsing and slicing helpers to `api/utils/filterQuery.js`, then apply them in `coachHandlers.js` and `teamHandlers.js` after current filtering logic. Keep the current response fields intact and append pagination metadata near the arrays it describes.

Thread page/limit values through `src/actions/queryParams.js`, `coachAction.js`, and `teamAction.js`. Store pagination metadata and current page/limit values in the relevant reducers. Add small previous/next controls in existing navigation/list components and have page changes refetch through the current action creators with the existing season and filter state.

## 8. Risks & edge cases
- Dashboard players are currently deduplicated client-side after flattening teams; server-side player pagination must not make stats and roster disagree.
- Paginating nested teams and players at the same time can be confusing; initial controls should label each paginated collection clearly.
- Filtering can reduce total counts; page state must reset to `1` when filters or season change.
- A requested page beyond the last page should return an empty array with valid metadata, or clamp consistently; the implementation should choose one behavior and test it.
- Existing response payloads are already built in memory, so this feature improves UI usability but not database load.
- Notification display currently returns the newest 10 notifications; changing this must preserve unread count semantics.

## 9. Security concerns
- Preserve all existing `ensureAuthenticated`, coach-id ownership, team membership, and collaboration authorization checks.
- Validate page and limit query params before using them.
- Cap limits to prevent very large responses.
- Do not expose counts for unauthorized teams or players.
- Keep validation errors generic and consistent with existing `sendValidationError` behavior.

## 10. Testing strategy
- Add unit-style coverage for pagination parsing helper defaults, invalid values, max-limit capping, and offset math.
- Add API regression tests for `GET /api/v1/coaches/:id` with default pagination, custom pagination, filters plus pagination, invalid pagination values, and empty page behavior.
- Add API regression tests for `GET /api/v1/teams/:id` with player pagination and filters plus pagination.
- Add action tests proving pagination query params serialize only when present and combine correctly with existing season/search params.
- Add reducer tests proving pagination metadata and requested pagination state update without dropping filters.
- Add component tests for previous/next disabled states and callback payloads.
- Run `npm test -- --watchAll=false` and `npm run lint`.

## 11. Assumptions and unresolved questions
- Assumption: the selected backlog item is the first unchecked item in `docs/backlog.md` because the skill invocation left `selected_backlog_item` and `feature_slug` as placeholders.
- Assumption: pagination should target existing dashboard and team detail read flows rather than adding new endpoints.
- Assumption: response-level pagination is acceptable for this step because the repository currently loads nested Bookshelf relationships before shaping payloads.
- Assumption: default limits can be chosen conservatively in code, likely 10 or 25 depending on current UI density.
- Unresolved question: whether dashboard team pagination and player/stat pagination should be independently controllable in the first implementation or whether v1 should only paginate player-heavy collections.
- Unresolved question: whether out-of-range pages should clamp to the last page or return an empty page with metadata.

## 12. Step-by-step plan
- [x] Add pagination parsing and slicing helpers in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/filterQuery.js`.
- [x] Extend `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js` to parse `playerPage` and `playerLimit`, paginate filtered team players, and append `playerPagination` metadata.
- [x] Extend `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js` to parse dashboard pagination params, paginate filtered dashboard collections, and append additive pagination metadata.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/queryParams.js` only if needed so numeric pagination params serialize consistently with existing query params.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js` to include pagination params with existing season and filter params.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js` to include pagination params with existing season and filter params.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js` to store requested dashboard pagination state and response pagination metadata.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js` to store requested team-detail pagination state and response pagination metadata.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` to reset pagination on season/filter changes and dispatch page changes with current query state.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` to reset pagination on season/filter changes and dispatch page changes with current query state.
- [x] Add pagination controls to `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js` or the relevant dashboard list components using existing Bulma styling.
- [x] Add pagination controls to `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js` or `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js` using existing Bulma styling.
- [x] Update empty states in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`, and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js` to account for filtered empty pages.
- [x] Add server regression coverage in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` for pagination defaults, custom page/limit values, filters plus pagination, invalid values, and empty pages.
- [x] Add client action tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js` for combined query serialization.
- [x] Add reducer tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js` for pagination state and metadata.
- [x] Add component tests for pagination controls and disabled states in the touched dashboard and team detail component test files.
- [x] Run `npm test -- --watchAll=false` to verify the plan’s intended test surface.
- [x] Run `npm run lint` to verify repository style after implementation.
