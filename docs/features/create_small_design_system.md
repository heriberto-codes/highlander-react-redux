# Create a small design system

## Summary
- Added a small client-side design-system layer for shared Highlander UI primitives.
- Added shared CSS tokens and utility classes for Highlander colors, spacing, panel radius, status spacing, and focus treatment.
- Introduced reusable `Button`, `StatusMessage`, `EmptyState`, `SectionPanel`, and `PaginationControls` components.
- Adopted the primitives in dashboard, list, navigation, and team-detail surfaces where repeated markup already existed.
- Preserved existing Redux selectors, dispatch behavior, route paths, API calls, payloads, and pagination/filter behavior.
- Verified the completed implementation with focused Jest coverage, the full Jest suite, ESLint, security review, and performance review.
- Marked the matching backlog item complete after all plan steps and validation gates passed.

## Architecture Impact
- The design system lives inside the existing React client boundary:
  - `src/css/design-system.css`
  - `src/components/ui/`
- Bulma remains the base styling framework.
- Shared primitives are thin presentational wrappers around existing Bulma classes and semantic HTML.
- `src/index.js` imports the design-system CSS once for app-wide token availability.
- No new framework, state-management pattern, API endpoint, database schema, migration, server route, or auth/session behavior was introduced.
- Server-side authorization and data contracts remain unchanged.

## Decisions
- Kept the first design-system pass intentionally small and incremental.
- Used CSS custom properties for existing Highlander color and spacing values instead of rewriting global CSS.
- Built primitives with className passthroughs so future adoption can remain local and low-risk.
- Preserved element semantics in `Button`:
  - `button` for form and click actions
  - `a` for legacy static-page links
  - React Router `Link` for internal route navigation
- Extracted repeated pagination UI into `PaginationControls` while keeping labels, aria labels, disabled states, and page callbacks behavior-preserving.
- Used `StatusMessage` for loading, success, warning, and error notifications with alert roles only for warning/error defaults.
- Left legacy surfaces outside the touched dashboard/team-detail areas unchanged.

## Components Added
- `src/components/ui/Button.js`
  - Normalizes Bulma button classes across `button`, `a`, and React Router `Link` use cases.
  - Preserves click passthrough, submit behavior, disabled behavior, and navigation targets.
- `src/components/ui/StatusMessage.js`
  - Standardizes Bulma notification markup for loading, success, warning, and error states.
  - Renders nothing when no content is provided.
- `src/components/ui/EmptyState.js`
  - Standardizes repeated empty-list messaging with notification styling.
  - Supports default messages, custom messages, children, and className passthrough.
- `src/components/ui/SectionPanel.js`
  - Standardizes repeated `tile is-child box header` panel framing.
  - Supports headings, optional icon class, action slot, children, and className passthrough.
- `src/components/ui/PaginationControls.js`
  - Standardizes previous/next pagination controls.
  - Hides itself for missing pagination or single-page result sets.

## Components Updated
- `src/index.js`
- `src/css/design-system.css`
- `src/components/DashboardNavigation.js`
- `src/components/TeamDetailsNavigation.js`
- `src/components/TeamsList.js`
- `src/components/RosterList.js`
- `src/components/StatsList.js`
- `src/components/TeamDetailsComponent.js`
- `src/pages/Dashboard.js`
- `src/pages/TeamDetails.js`

## Adoption Scope
- Dashboard list surfaces now use shared panels, action buttons, empty states, and pagination controls:
  - Teams list
  - Roster list
  - Stats list
- Dashboard and Team Details pages now use `StatusMessage` for profile loading and error notices.
- Team Details collaborator and game-entry areas now use shared buttons, status messages, empty states, and pagination controls where behavior was already present.
- Dashboard and Team Details navigation controls now use shared `Button` instances for actions and `hl-focusable` for filter/season controls.
- Existing link targets, form submit behavior, filter inputs, season selectors, callbacks, empty messages, and pagination calculations were preserved.

## User-Facing Behavior
- The dashboard and team-detail surfaces keep the same workflows and labels while using shared UI primitives.
- Add team/player/stats links still target their existing destinations.
- Filter forms still submit through the existing callbacks.
- Season changes still request the same filtered profile data.
- Pagination still shows the current page and disables previous/next actions when movement is unavailable.
- Empty list and status messages now share consistent notification spacing and styling.
- Keyboard focus styling is more consistent on adopted filter and season controls.

## Test Impact
- Added focused tests for the new UI primitives:
  - `src/components/ui/Button.test.js`
  - `src/components/ui/StatusMessage.test.js`
  - `src/components/ui/EmptyState.test.js`
  - `src/components/ui/SectionPanel.test.js`
  - `src/components/ui/PaginationControls.test.js`
- Updated list, navigation, dashboard, and team-detail tests where markup changed:
  - `src/components/TeamsList.test.js`
  - `src/components/RosterList.test.js`
  - `src/components/StatsList.test.js`
  - `src/components/TeamDetailsComponent.test.js`
  - `src/components/DashboardNavigation.test.js`
  - `src/components/TeamDetailsNavigation.test.js`
  - `src/pages/Dashboard.test.js`
  - `src/pages/TeamDetails.test.js`

Verification completed:
- Focused Jest:
  - Passed: 11 test suites, 93 tests.
- Full Jest:
  - Passed: 36 test suites, 425 tests.
  - The first sandboxed run failed only because `src/server.test.js` could not bind a local Supertest listener; the same command passed with escalated local listener permissions.
- ESLint:
  - Passed with exit code 0.
  - Reported 0 errors and 11 warnings.
- Security review:
  - No blocking security issues found.
  - Confirmed the feature did not change auth, authorization, APIs, database access, session handling, secrets, or server validation.
- Performance review:
  - No material performance issues found.
  - Confirmed the feature did not introduce new network calls, duplicate fetches, DB queries, blocking operations, or large payload paths.

## API Changes
- None.

## Database Changes
- None.

## Deployment Notes
- No migrations, environment variable changes, deployment sequencing, or server changes are required.
- The new CSS file is imported through the existing React entry point.
- The implementation depends on the existing Bulma CSS and React Router setup already used by the client.

## Risks / Accepted Tradeoffs
- Existing non-blocking lint warnings remain in legacy/shared files:
  - `server.js`
  - `src/components/AddPlayerModal2.js`
  - `src/components/Footer.js`
  - `src/components/Hero.js`
  - `src/components/LoginForm.js`
  - `src/components/RegisterForm.js`
  - `src/reducers/coachReducer.js`
- Some older pages and CSS files still contain legacy markup or color usage outside the adopted surfaces.
- Visual verification was not performed in this step; behavior was validated through focused tests, the full Jest suite, audit searches, and lint.
- The `Button` wrapper must continue preserving element choice carefully so future adoption does not alter form submit, static-link, or router-link behavior.
- `StatusMessage` intentionally defaults alert roles only for warning/error variants to avoid over-announcing loading/success messages.
- Future `Button` callers should avoid passing untrusted dynamic `href` or `to` values.

## Follow-ups
- Clean existing lint warnings in a separate maintenance task.
- Continue adopting the primitives in other legacy surfaces only when behavior-preserving and supported by focused tests.
- Consider a manual browser pass of Dashboard and Team Details to confirm visual spacing, focus states, and button presentation in real layouts.
- Consider documenting primitive usage conventions if the design-system layer grows beyond this initial small set.
