# Add Pagination and Query Capabilities

## Summary
- Added pagination support to existing protected coach dashboard and team detail read flows.
- Existing season, search, and position filters remain supported and now combine with pagination query params.
- Dashboard team, roster, stats, and team detail player lists now expose simple previous/next pagination controls.
- Empty list messaging now distinguishes an empty requested page from true no-data or no-match states.

## Architecture Impact
- Preserves the existing Express handler structure and React/Redux class-component flow.
- Adds shared pagination parsing/slicing helpers in `api/utils/filterQuery.js`.
- Keeps API response changes additive by preserving current arrays and adding pagination metadata.
- Uses response-level pagination after existing authorization, filtering, and derived-stat calculation; no new service layer or endpoint family was introduced.

## Decisions
- Default pagination is page `1` with limit `10`.
- Page and limit query params must be positive integers.
- Limits are capped at `100`.
- Out-of-range pages return `200` with empty arrays and pagination metadata rather than clamping.
- Dashboard roster and stats share player pagination because both render from the dashboard player collection.
- Season and filter changes reset relevant page numbers to `1` while preserving current limits.

## API Changes
- `GET /api/v1/coaches/:id`
  - Keeps existing query params: `season`, `teamSearch`, `playerSearch`, `position`.
  - Adds query params: `teamPage`, `teamLimit`, `playerPage`, `playerLimit`, `notificationLimit`.
  - Adds response metadata: `teamPagination`, `playerPagination`, `notificationPagination`.
- `GET /api/v1/teams/:id`
  - Keeps existing query params: `season`, `playerSearch`, `position`.
  - Adds query params: `playerPage`, `playerLimit`.
  - Adds response metadata: `playerPagination`.

## Database Changes
- None.

## Test Impact
- Added/updated server regression coverage for pagination defaults, custom page/limit values, filters plus pagination, invalid values, and empty pages.
- Added/updated client action tests for combined query serialization.
- Added/updated reducer tests for requested pagination state and API pagination metadata.
- Added/updated component tests for pagination controls, disabled states, callbacks, and empty-page states.
- Verified `npm test -- --watchAll=false`: 25 suites passed, 355 tests passed.
- Verified `npm run lint`: 0 errors, 35 warnings.

## Deployment Notes
- No migrations or environment variable changes are required.
- Response payloads include additional metadata fields, but existing array fields remain in place.

## Follow-ups / Accepted Risks
- Pagination is response-level only; handlers still load related teams, players, stats, games, and notifications before slicing.
- Database-level pagination may be needed later if large coach or team datasets become common.
- Lint still reports warning-level legacy issues, including unused variables and unreachable code warnings.
- `notificationLimit` is supported, but notification page navigation is not exposed in the UI in this feature.
