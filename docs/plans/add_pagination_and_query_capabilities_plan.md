# Plan: Add pagination and query capabilities

Backlog item: `- [ ] Add pagination and query capabilities`

Feature slug: `add_pagination_and_query_capabilities`

## 1. Architecture grounding from `architecture.md`
Highlander is a monolithic Express 4 + React 17 application. API routes are mounted under `/api/v1`, route files live in `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/`, and request orchestration belongs in matching handler modules under `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/`. The data layer is PostgreSQL through Bookshelf/Knex. The client is a React SPA with route pages in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/`, Redux state in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/`, and thunk action creators in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/`. Existing architecture favors additive API changes, manual validation, route/handler-level business logic, and preserving response payload shapes.

## 2. Tech stack detected from `architecture.md` and confirmed against repo
Backend: Node.js, Express 4, body-parser, helmet, cors, morgan.

Data: PostgreSQL, Knex migrations/seeds, Bookshelf models.

Auth: `express-session`, `connect-pg-simple`, `bcrypt`, session-backed `ensureAuthenticated`.

Frontend: React 17, Redux, react-redux, redux-thunk, redux-form, react-router-dom 6, axios, Bulma.

Testing: Jest through `react-scripts test`, supertest for API tests, ESLint through `npm run lint`.

## 3. Files impacted
Primary server files:

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/filterQuery.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/apiErrors.js`

Primary client files:

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/queryParams.js`
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

Test files:

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.test.js`

## 4. Data / DB changes
No database changes for the first implementation.

Existing dashboard and team-detail endpoints already fetch full related graphs and then apply season/search filters in handlers. The safest incremental path is to add bounded pagination at the payload-shaping layer, preserving current schema and avoiding index/migration work until real volume requires database-level pagination.

Future DB-level pagination may need indexed query paths for `teams.name`, `teams.season`, `players.first_name`, `players.last_name`, and `players.position`, but that is out of scope for this plan.

## 5. API endpoints
Extend existing read endpoints only.

`GET /api/v1/coaches/:id`:

- Existing optional query params remain: `season`, `teamSearch`, `playerSearch`, `position`
- Add optional pagination params for top-level dashboard collections: `page`, `pageSize`
- Response remains the current coach payload plus additive pagination metadata

`GET /api/v1/teams/:id`:

- Existing optional query params remain: `season`, `playerSearch`, `position`
- Add optional pagination params for returned players: `page`, `pageSize`
- Response remains the current team payload plus additive pagination metadata

Validation rules:

- Missing or empty `page` means page 1
- Missing or empty `pageSize` means a small default page size
- `page` and `pageSize` must be positive integers
- `pageSize` must be capped server-side
- Invalid pagination values return the existing validation error shape and status

## 6. Frontend components
Dashboard:

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`

Team details:

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`

Redux/action flow:

- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`

## 7. Implementation approach
Keep this feature additive. Reuse `api/utils/filterQuery.js` for parsing and normalization, extending it with pagination parsing and pagination metadata helpers. Apply existing season/search filters first, then paginate the filtered result set so metadata reflects the visible query. Preserve authorization checks and current response fields.

On the client, extend existing query-string builders and Redux state with `page` and `pageSize`. Add compact pagination controls near the existing filter/season controls. Reset page to 1 when season/search/filter values change. Do not add a new routing pattern, state library, endpoint group, or backend service layer.

## 8. Risks & edge cases
Pagination after in-memory filtering does not reduce database load for large coach/team graphs, but it is the smallest safe change against the current Bookshelf eager-load pattern.

Dashboard payload semantics are nested: teams, roster players, and stats are derived from the same filtered team graph. The first implementation should paginate one clear top-level collection per endpoint and document what metadata represents.

Changing page while a season or search filter is active must preserve all active query params.

Requests for pages beyond the last page should return an empty visible collection with valid metadata, not a 404.

Existing components may assume arrays are complete. Tests must cover derived stats, empty pages, and filter resets.

## 9. Security concerns
Keep `ensureAuthenticated` and coach/team ownership checks unchanged.

Validate and cap pagination values to avoid oversized responses.

Do not expose counts for unauthorized teams or players. Counts and totals must be computed only after auth scoping and current query filtering.

Avoid user-controlled regex or raw SQL query composition.

## 10. Testing strategy
API tests should cover default pagination, explicit page/pageSize, invalid values, capped page size behavior, combined search plus pagination, empty pages, and unchanged authorization behavior.

Action tests should verify query-string generation for season, filters, page, and pageSize.

Reducer tests should verify pagination state updates, page reset on filter changes, and metadata persistence after success responses.

Component tests should verify pagination controls render, call the correct handlers, disable previous/next at boundaries, and preserve empty-state behavior.

Run targeted tests first, then `npm test -- --watchAll=false` and `npm run lint` if implementation touches JS/JSX.

## 11. Assumptions and unresolved questions
Assumption: because no selected backlog item was pasted, this plan uses the first unchecked backlog item in `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/backlog.md`: `Add pagination and query capabilities`.

Assumption: v1 pagination should be additive metadata on existing read endpoints rather than new endpoint families.

Assumption: default page size should be small and capped in `api/utils/filterQuery.js`; exact default and maximum should be set during implementation based on current UI density and tests.

Unresolved question: dashboard pagination must choose whether `page/pageSize` applies to teams, aggregated players, or both. Safest v1 recommendation is top-level teams on the dashboard and players on team details, with additive metadata names that make that explicit.

Unresolved question: whether later work should move filtering/pagination into database queries. This plan intentionally defers that until current behavior and payload contracts are preserved with tests.

## 12. Step-by-step plan
- [ ] Extend `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/filterQuery.js` with `parsePaginationQuery` and `paginateCollection` helpers that validate positive integer `page` and `pageSize`, apply defaults, cap page size, and return additive pagination metadata.
- [ ] Add focused tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` for pagination helper behavior through `GET /api/v1/coaches/:id`, including defaults, explicit values, invalid values, and page bounds after existing search filters.
- [ ] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/coachHandlers.js` to parse pagination after existing dashboard filters, paginate the filtered dashboard teams collection, and attach additive dashboard pagination metadata without changing auth or existing coach fields.
- [ ] Add focused tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js` for `GET /api/v1/teams/:id` pagination defaults, explicit values, invalid values, empty page behavior, and combined player search plus pagination.
- [ ] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/handlers/teamHandlers.js` to parse pagination after existing team filters, paginate the filtered players collection, and attach additive players pagination metadata without changing team, coach, collaborator, season, or derived stat fields.
- [ ] Extend `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/queryParams.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.js`, and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js` so existing request builders serialize non-empty `page` and `pageSize` alongside season and filter params.
- [ ] Add action tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/coachAction.test.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js` for combined season, filter, page, and pageSize query strings.
- [ ] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js` to store pagination request state and response metadata, resetting page to 1 when search, position, or season changes.
- [ ] Add reducer tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/coachReducer.test.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js` for default pagination state, successful metadata handling, page changes, and filter-triggered page resets.
- [ ] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js` to pass dashboard pagination state and next/previous/page-size handlers through the existing dashboard fetch flow.
- [ ] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js` to pass team player pagination state and next/previous/page-size handlers through the existing team profile fetch flow.
- [ ] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`, and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js` only as needed to show bounded pagination context and preserve clear empty states for filtered or out-of-range pages.
- [ ] Add component tests in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.test.js`, `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.test.js`, and affected list component tests for pagination controls, disabled boundary states, and empty page rendering.
- [ ] Run the targeted server, action, reducer, and component tests touched by this plan, then run `npm test -- --watchAll=false` and `npm run lint` before considering the plan step complete in the state system.
