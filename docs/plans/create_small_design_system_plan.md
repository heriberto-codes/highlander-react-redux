# Plan: Create a small design system

Backlog item: `- [ ] Create a small design system`

Feature slug: `create_small_design_system`

## 1. Architecture grounding from `architecture.md`
- Highlander is a monolithic React and Express application for coach team, roster, and stat management.
- The client is a React 17 SPA in `src/`, with route-level pages in `src/pages/` and shared/presentational components in `src/components/`.
- Routing uses `react-router-dom` v6 in `src/container/App.js`.
- Client state uses Redux, Redux Thunk, and Redux Form; this feature should not change state shape or data flow.
- Bulma is already installed and imported by existing components; the design system should build on existing Bulma classes and local CSS rather than adding a new styling framework.
- Server, API, database, session, authorization, and payload contracts are outside the scope of this client-only feature.

## 2. Tech stack detected from `architecture.md` and confirmed against repo
- React 17.0.2
- React DOM 17.0.2
- React Router DOM 6.22.3
- Redux 4.2.1
- React Redux 8.1.1
- Redux Thunk 2.4.2
- Redux Form 8.3.10
- Bulma 0.9.4
- Jest through `react-scripts test`
- ESLint through `npm run lint`

Context7 documentation checked:
- React official docs recommend extracting reusable UI into components, passing data and behavior through props, and composing components through children where appropriate.

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/css/design-system.css`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/index.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/Button.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/Button.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/EmptyState.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/EmptyState.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/StatusMessage.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/StatusMessage.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/SectionPanel.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/SectionPanel.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/PaginationControls.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/PaginationControls.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/create_small_design_system.md`

## 4. Data / DB changes
None.

## 5. API endpoints
None.

## 6. Frontend components
- Add a small `src/components/ui/` layer for reusable presentational components only.
- Add `Button` to normalize internal links, anchors, and buttons while preserving existing click, submit, disabled, and navigation behavior.
- Add `StatusMessage` to standardize loading, success, warning, and error messaging through Bulma notification classes.
- Add `EmptyState` for repeated empty list messages in dashboard, roster, stats, and team details surfaces.
- Add `SectionPanel` for repeated Bulma `tile is-child box header` panel framing and heading rows.
- Add `PaginationControls` to remove duplicated pagination markup from `TeamsList`, `RosterList`, `StatsList`, and `TeamDetailsComponent` if adoption remains small and behavior-preserving.
- Keep existing page layout, Redux selectors, action dispatches, routes, and API calls unchanged.

## 7. Implementation approach
Create a minimal design-system CSS file with custom properties for existing colors, spacing, border radius, and focus treatment. Import it once from `src/index.js` after Bulma/local CSS is already available, or from the existing global CSS path if that better matches current import order.

Build UI components as thin wrappers around Bulma class names and existing semantic HTML. Each component should accept className passthroughs so migration can be incremental and low-risk. Start with components that remove real duplication already visible in the repo: notification messages, panel headings, repeated pagination controls, and primary/outlined button variants.

Adopt the components in dashboard and team details areas first because those pages contain the most repeated list, pagination, and status UI. Avoid broad visual redesign, CSS rewrites, or changes to home-page marketing content unless a specific shared token can be applied without behavior risk.

## 8. Risks & edge cases
- Changing class names can unintentionally break tests that query CSS selectors or existing visual styling.
- Replacing anchors with router links or buttons can alter navigation, form submit, or browser behavior; preserve element type intentionally.
- Pagination callbacks must keep the current disabled-state behavior and page-number calculations.
- Status messages should keep accessible `role="alert"` only for errors or warnings where interruption is useful.
- CSS custom properties must not override Bulma globally in ways that affect unrelated pages unexpectedly.
- Duplicate CSS currently exists across `style.css`, `nav.css`, and `login.css`; consolidate only narrow token usage in this feature.

## 9. Security concerns
- No server-side security changes are required.
- Do not expose raw API error objects in shared status components.
- Preserve existing route protection, session bootstrap, and server authorization assumptions.
- Ensure button/link wrappers do not enable external redirect behavior from untrusted values.

## 10. Testing strategy
- Add focused component tests for each new UI primitive to verify rendering, class variants, disabled states, children composition, and event callbacks.
- Update existing dashboard/team list tests only where markup changes require query updates.
- Verify `PaginationControls` behavior with previous/next disabled and enabled states before replacing local copies.
- Run focused Jest tests for changed UI components and adopted pages.
- Run `npm test -- --watchAll=false` after implementation.
- Run `npm run lint` after tests pass.
- For visual risk, run the client locally and inspect dashboard and team details in the browser after implementation.

## 11. Assumptions and unresolved questions
- Assumption: the selected backlog item is the next unchecked item in `docs/backlog.md`: `Create a small design system`.
- Assumption: "small design system" means reusable client UI primitives plus shared style tokens, not a full redesign or external component library.
- Assumption: Bulma remains the base styling framework because it is already installed and used throughout the client.
- Assumption: dashboard and team details are the safest first adoption targets because they contain repeated operational UI patterns.
- Assumption: no changes are needed to Express routes, database schema, migrations, or Redux contracts.
- Unresolved question: whether the home page should be included in initial adoption; this plan leaves it mostly unchanged unless token imports are global.

## 12. Step-by-step plan
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/css/design-system.css` with scoped CSS custom properties and small utility classes for Highlander colors, spacing, panel radius, focus states, and status message spacing.
- [x] Import `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/css/design-system.css` through `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/index.js` or the existing global CSS import path without changing application bootstrapping.
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/Button.js` as a thin Bulma-compatible wrapper for `button`, `a`, and React Router `Link` use cases.
- [x] Add `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/Button.test.js` covering variant classes, element type selection, disabled behavior, children rendering, and click passthrough.
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/StatusMessage.js` for loading, success, warning, and error notification states with safe message rendering.
- [x] Add `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/StatusMessage.test.js` covering message variants, alert roles for warning/error, and className passthrough.
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/EmptyState.js` for repeated empty list messaging with Bulma notification styling.
- [x] Add `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/EmptyState.test.js` covering default and custom messages plus optional className passthrough.
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/SectionPanel.js` to standardize repeated `tile is-child box header` panel structure while allowing existing headings and actions through props or children.
- [x] Add `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/SectionPanel.test.js` covering title, icon class, action slot, children, and className passthrough.
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/PaginationControls.js` by extracting the existing previous/next pagination behavior without changing labels, aria labels, disabled logic, or page calculations.
- [x] Add `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui/PaginationControls.test.js` covering hidden single-page pagination, enabled previous/next callbacks, disabled buttons, and page count rendering.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.js` to use `SectionPanel`, `Button`, `EmptyState`, and `PaginationControls` while preserving current link targets, empty messages, season text, and pagination behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamsList.test.js` for any markup query changes and preserve existing behavior assertions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.js` to use `SectionPanel`, `Button`, `EmptyState`, and `PaginationControls` while preserving current player card rendering and pagination behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/RosterList.test.js` for any markup query changes and preserve existing behavior assertions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.js` to use `SectionPanel`, `Button`, `EmptyState`, and `PaginationControls` while preserving table rendering, empty messages, and pagination behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/StatsList.test.js` for any markup query changes and preserve existing behavior assertions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js` to reuse `Button`, `StatusMessage`, `EmptyState`, and `PaginationControls` in collaborator, game-entry, and roster areas without changing submission payloads or collaborator callbacks.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.test.js` for any markup query changes and preserve existing game-entry, collaborator, empty-state, and pagination behavior assertions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.js` to use `StatusMessage` for profile loading and error states without changing selectors, effects, or dispatch behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/Dashboard.test.js` for any markup query changes and preserve existing profile fetch, filter, season, and pagination assertions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js` to use `StatusMessage` for team-profile loading and error states without changing selectors, effects, route id handling, or dispatch behavior.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js` for any markup query changes and preserve existing team-profile, filter, game-entry, and collaborator assertions.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js` only for safe `Button` and token class adoption that preserves forms, filter inputs, season selectors, and existing action labels.
- [x] Update `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/DashboardNavigation.test.js` and `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.test.js` for any markup query changes while preserving filter and action callback assertions.
- [x] Search `/Users/hroman_codes/Documents/Code/highlander-react-redux/src` for duplicated pagination markup, repeated empty-state notification markup, raw status messages, and hardcoded Highlander color values left in touched surfaces.
- [x] Run focused Jest tests for `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/ui`, dashboard list components, `Dashboard`, and `TeamDetails`.
- [x] Run `npm test -- --watchAll=false` to validate the complete client/server test suite.
- [x] Run `npm run lint` to verify imports, JSX, and component wrapper usage.
- [x] Create `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/features/create_small_design_system.md` documenting the completed design-system primitives, adoption scope, tests, risks, and follow-ups after implementation is complete.
