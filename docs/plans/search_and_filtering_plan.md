# Plan: Search and filtering

Backlog item: `- [ ] Search and filtering`

Feature slug: `search_and_filtering`

## 1. Architecture overview
Monolith. Express server in `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`. REST routes in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes`. React 17 SPA in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src`. Redux store drives dashboard and team detail pages. PostgreSQL via Knex + Bookshelf.

## 2. Detected technology stack
- Backend: Node.js, Express, body-parser, cors, helmet, morgan
- Auth: express-session, connect-pg-simple, bcrypt
- Data: PostgreSQL, Knex, Bookshelf
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk, redux-form
- HTTP/UI: axios, Bulma
- Tests: Jest via react-scripts, supertest

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/playerAnalytics.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.test.js`

## 4. Database changes
None in v1.

Reason:
- Existing payloads already return teams, players, stats, season metadata.
- Low-risk path: filter in API/controller layer and Redux/UI layer.

Migration risks:
- None if no schema change.
- If future search must scale to large datasets, add indexed columns later, likely `teams.name`, `players.first_name`, `players.last_name`, `players.position`, maybe trigram/full-text. Defer now.

## 5. API endpoints
Extend existing read endpoints only.

- `GET /coaches/:id`
  - add optional query params:
  - `season`
  - `teamSearch`
  - `playerSearch`
  - `position`
- `GET /teams/:id`
  - add optional query params:
  - `season`
  - `playerSearch`
  - `position`

Contract rules:
- additive only
- preserve current response shape
- ignore empty query params
- invalid filter values return `400` only when format invalid, not when no matches

## 6. Frontend components
Primary surfaces:
- Dashboard: search teams, search roster/stats players, filter by position, keep season selector
- Team details: search players, filter by position, keep season selector

Likely control placement:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`

Display consumers:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`

## 7. Safest implementation approach
Use additive query params on existing endpoints. Keep server as source of truth for filtered datasets. Keep Redux state for active filters. Fetch on filter change. Avoid new endpoints, new libraries, schema work, client-only duplicate filtering logic, and broad refactors.

Why safest:
- aligns with current REST shape
- small diffs
- no DB migration
- no auth/session changes
- avoids client/server divergence for season + search combinations

## 8. Risks and edge cases
- Current team details page still uses legacy router props; filter work can expose existing route bug.
- Empty search should behave as no filter.
- Search + season filter combination must not strip `availableSeasons`.
- Team search on dashboard should not break roster/stats aggregation semantics.
- Player search can hide rows and make stats tables appear empty; need explicit empty state.
- Position values are free-text in current schema; casing/spelling inconsistencies likely.
- Large payloads still load full coach/team graphs before filtering if filtering stays post-fetch in route handler.
- Current stat attribution limits remain: same-season team changes still ambiguous.

## 9. Security concerns
- Validate and bound query params.
- Trim input; reject overly long search strings.
- Do not add regex-from-user behavior.
- Preserve `ensureAuthenticated` on protected data only; do not widen data exposure.
- Do not leak hidden teams/players through count metadata unless already visible in payload.

## 10. Testing strategy
- Route tests: query param parsing, combined season + search filtering, position filtering, empty result sets, invalid filter input.
- Action tests: correct query-string generation.
- Reducer tests: filter state updates, cleared filters, response handling.
- Component tests: controls render, callbacks fire, empty-state rendering.
- Regression tests: existing season behavior unchanged when no filters provided.

## 11. Step-by-step implementation plan

Step 1: Define filter contract
Goal: lock additive API/query behavior before code spread
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
Changes:
- document allowed query params, normalization, invalid-input rules, response invariants
- add inline route comments only if needed
Done when:
- filter contract is explicit in code comments/docs and preserves current payload shape

Step 2: Add server-side filter parsing helpers
Goal: centralize safe parsing and matching
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
Changes:
- add helper functions for trimmed search text, bounded length, case-insensitive matching, optional position filter
- add invalid-format handling
Done when:
- both routes can parse filter query params without duplicating ad hoc logic

Step 3: Apply filters to coach dashboard payload
Goal: enable filtered dashboard reads without contract break
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
Changes:
- filter teams by `teamSearch`
- filter team players by `playerSearch` and `position`
- rebuild dashboard player aggregation from filtered teams only
- keep `availableSeasons` and `activeSeason`
Done when:
- `GET /coaches/:id` returns filtered teams/players/stats and unfiltered behavior stays identical when no filters passed

Step 4: Apply filters to team detail payload
Goal: enable filtered team detail reads
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
Changes:
- filter returned players by `playerSearch` and `position`
- preserve coach/team metadata and season metadata
Done when:
- `GET /teams/:id` supports filters and unchanged requests still match current behavior

Step 5: Extend Redux actions for filter-aware requests
Goal: send query params through existing action creators
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
Changes:
- add filter args to request builders
- serialize only non-empty params
Done when:
- actions can request season-only, search-only, position-only, and combined filters

Step 6: Add Redux filter state
Goal: make active filters explicit and predictable
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
Changes:
- store active search/filter values
- add clear/reset behavior on fresh loads where needed
Done when:
- current filter selections survive rerender and map cleanly to outgoing requests

Step 7: Add dashboard filter controls
Goal: expose search/filtering on main coach view
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
Changes:
- add controlled search/filter inputs
- trigger refetch on submit or explicit apply
- keep season selector behavior intact
Done when:
- dashboard user can set team/player/position filters and see filtered data after request

Step 8: Add team detail filter controls
Goal: expose search/filtering on team detail view
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
Changes:
- add controlled player search and position filter
- trigger refetch on apply
- keep existing add-player and game-entry actions intact
Done when:
- team detail user can filter visible roster rows without breaking existing page actions

Step 9: Update list/table empty states
Goal: make filtered-empty results understandable
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
Changes:
- distinguish “no data yet” vs “no matches for current filters”
- show active-season context if present
Done when:
- empty filtered results render intentional messaging, not blank containers

Step 10: Add API regression tests
Goal: prove filter logic and contract safety
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
Changes:
- add route tests for coach/team filter params and invalid inputs
- keep existing season tests passing
Done when:
- server tests cover no-filter baseline plus combined-filter cases

Step 11: Add client tests
Goal: prove request wiring and UI behavior
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.test.js`
Changes:
- add serialization, reducer-state, and empty-state tests
Done when:
- tests cover query generation, filter state, and filtered-empty rendering

Step 12: Verify docs and rollout notes
Goal: keep docs aligned with shipped contract
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/README.md`
Changes:
- add concise endpoint/query-param notes if feature ships
- note no schema change in rollout
Done when:
- docs reflect final query params and user-visible behavior

## Assumptions
- v1 scope is read-side search/filtering only, not create/edit flows.
- Existing endpoints remain source of truth; no new `/api` namespace now.
- Filtering should work with current season-aware dashboard/team endpoints, not separate search endpoints.
- Position filter can use current free-text `players.position` values without normalization table.
- Small/medium data volumes make controller-level filtering acceptable for first release.

## Unresolved questions that must be answered before implementation
- Exact UX scope: dashboard only, team details only, or both.
- Exact search scope on dashboard: teams only, players only, stats rows only, or all three.
- Should filters apply live on keystroke or only on explicit submit/apply.
- Should filter state persist in URL/query string on client routes.
- Is substring match sufficient, or is prefix/exact match wanted for position.
- Should unauthorized coach/team ownership checks be fixed in same feature if touched routes are modified.
