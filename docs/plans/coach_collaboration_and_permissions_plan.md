# Plan: Coach collaboration and permissions

Backlog item: `- [x] Coach collaboration and permissions`

Feature slug: `coach_collaboration_and_permissions`

## 1. Architecture overview
Monolith. Express API in `/Users/hroman_codes/Documents/Code/highlander-react-redux/server.js`. React 17 SPA in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src`. PostgreSQL via Knex + Bookshelf. Existing coach/team association already uses many-to-many `coaches_teams`; safest feature shape is additive role-based collaboration on that existing join.

## 2. Detected technology stack
- Backend: Node.js, Express, body-parser, cors, helmet, morgan
- Auth: express-session, connect-pg-simple, bcrypt
- Data: PostgreSQL, Knex, Bookshelf
- Frontend: React 17, react-router-dom 6, Redux, react-redux, redux-thunk, redux-form
- HTTP/UI: axios, Bulma
- Tests: Jest via `react-scripts`, `supertest`

## 3. Files impacted
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_add_role_to_coaches_teams>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_ucoach_associations.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/coachRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/authorization.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/coach_collaboration_and_permissions_plan.md`

## 4. Database changes
- Add additive permission metadata to `coaches_teams`.
- Minimum safe column:
  - `role` string not null
- Preferred initial roles:
  - `owner`
  - `assistant`
- Optional future-only, not required in v1:
  - invite status
  - invited_by
  - accepted_at

Migration risks:
- Existing rows need deterministic backfill, likely `owner`.
- Any new non-null column on join table must preserve current reads/writes.
- If multiple owners are disallowed later, DB constraints may need additional data cleanup first.

## 5. API endpoints
- Extend existing reads:
  - `GET /teams/:id`
    - include collaborator metadata for authorized coaches
  - `GET /coaches/:id`
    - keep existing shape; optionally expose collaboration indirectly through returned teams only
- Add collaboration management endpoints under existing team resource:
  - `GET /teams/:id/coaches`
  - `POST /teams/:id/coaches`
  - `PUT /teams/:id/coaches/:coachId`
  - `DELETE /teams/:id/coaches/:coachId`

Contract:
- Auth required on all collaboration endpoints
- Team membership required to read collaborators
- Elevated role required to modify collaborators
- Preserve existing team/player/stat endpoints; only tighten permission gates where needed
- Implemented collaborator management endpoints:
  - `GET /teams/:id/coaches`
  - `POST /teams/:id/coaches`
  - `PUT /teams/:id/coaches/:coachId`
  - `DELETE /teams/:id/coaches/:coachId`
- Implemented team detail enrichment:
  - `GET /teams/:id` returns `collaborators` and `currentCoachRole`

## 6. Frontend components
- Primary surface: team details page
- Likely controls:
  - collaborator list in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
  - collaboration actions in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- State/request flow:
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
  - `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`

## 7. Safest implementation approach
- Reuse `coaches_teams`; do not introduce a new collaboration table.
- Add role-based checks in `api/utils/authorization.js`, then apply them incrementally to write routes.
- Scope v1 to existing coach accounts only; no email invite flow, no notifications.
- Show/manage collaborators only from team details, where team context already exists.
- Keep response changes additive; do not rename existing fields.

## 8. Risks and edge cases
- Current schema already allows many coaches per team, but current code treats membership as enough; permission tightening can break existing assumptions.
- Need explicit rule for self-removal and last-owner removal.
- Resolved rule:
  - assistants may perform existing team/player/stat writes
  - assistants may not manage collaborators
- Duplicate coach-team attachments must be prevented.
- Team detail page already has router migration risk; new UI should avoid depending on more brittle route behavior.
- Known shipped UI gap:
  - empty collaborator coach id input is still coerced to `0` on the client; server-side route validation rejects it

## 9. Security concerns
- Never trust client-submitted role or target coach ownership without server validation.
- Restrict collaborator mutation to owner role in v1.
- Prevent privilege escalation:
  - assistant cannot promote self
  - assistant cannot remove owner
  - owner cannot remove the last owner without replacement
- Validate target coach exists before attaching.
- Preserve `ensureAuthenticated` and `requireTrustedOrigin` on mutating routes.

## 10. Implementation status
- Completed:
  - team-scoped collaborator roles persisted in `coaches_teams.role`
  - Bookshelf coach/team relations expose pivot `role`
  - role-aware authorization helpers
  - collaborator CRUD endpoints on `teams`
  - ordinary write permissions set to `owner+assistant`
  - additive team detail payload with `collaborators` and `currentCoachRole`
  - Redux actions and reducer state for collaborator flows
  - owner/assistant team details UI
  - backend and client test coverage for collaboration flows
- Remaining known gap:
  - client-side add-collaborator input validation should reject empty coach ids before dispatch

## 10. Testing strategy
- Route integration:
  - owner can list/add/update/remove collaborators
  - assistant can read but cannot mutate
  - unauthenticated requests fail
  - duplicate attach fails
  - last-owner removal fails
  - write routes respect tightened permissions
- Reducer/action:
  - collaborator request/success/error state
  - role update/removal state transitions
- Component:
  - owner sees management controls
  - assistant sees read-only collaborator list

## 11. Step-by-step implementation plan

Step 1: Define collaboration permission contract
Goal: lock v1 scope and role rules before schema/API work
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/authorization.js`
Changes:
- document v1 roles and protected operations
- define owner vs assistant permissions
- define self-removal and last-owner rules
Done when:
- route work can proceed without open permission-policy ambiguity

Step 2: Add role to coach-team association
Goal: persist team-scoped permissions on existing collaboration relation
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/migrations/<new_add_role_to_coaches_teams>.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/data/seeds/seed_ucoach_associations.js`
Changes:
- add non-null `role` column to `coaches_teams`
- backfill existing rows
- update seed data to include explicit roles
Done when:
- every coach-team association has a valid persisted role

Step 3: Expose role metadata in model relations
Goal: make collaborator roles available through existing Bookshelf patterns
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Coach.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/models/Team.js`
Changes:
- include join pivot role on coach/team many-to-many relations
Done when:
- team/coach fetches can read collaborator role without raw SQL fallback

Step 4: Add authorization helpers for role-based access
Goal: centralize permission checks before changing endpoints
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/utils/authorization.js`
Changes:
- add helpers for team membership, owner-role checks, and safe-removal rules
Done when:
- routes can gate read vs mutate behavior through shared helpers

Step 5: Add collaboration management API
Goal: create additive endpoints for collaborator CRUD on one team
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
Changes:
- add list/add/update/remove coach collaborator endpoints
- validate target coach existence, duplicate association, allowed roles
Done when:
- authorized owners can manage collaborators for one team through team-scoped routes

Step 6: Tighten existing team write permissions
Goal: align current write routes with explicit role model
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/playerRouter.js`
Changes:
- replace broad membership-based mutation checks where needed with owner-only or owner+assistant rules
- keep read access additive for all collaborators
Done when:
- write endpoints enforce the documented role contract

Step 7: Extend team detail payload for collaborators
Goal: give client enough data to render collaborator list and current user role
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/api/routes/teamRouter.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.js`
Changes:
- include collaborators and current coach role in team detail response or fetch via dedicated collaborator read endpoint
- add action creators for collaborator list/mutate flows
Done when:
- client can fetch collaboration data without extra assumptions

Step 8: Add Redux state for collaboration management
Goal: track collaborator data and mutation status predictably
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.js`
Changes:
- add collaborator collection
- add request/success/error state for add/update/remove flows
Done when:
- team reducer can drive collaborator UI and mutation feedback

Step 9: Add team details collaboration UI
Goal: expose read and management flows in existing team context
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsNavigation.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/components/TeamDetailsComponent.js`
Changes:
- render collaborator list
- render owner-only controls to add, change role, remove
- keep non-owner UI read-only
Done when:
- owner can manage collaborators from team details and assistant sees collaboration state read-only

Step 10: Add backend permission tests
Goal: lock authorization rules and prevent privilege regressions
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
Changes:
- add route tests for collaborator CRUD and tightened write permissions
Done when:
- server tests cover auth, role enforcement, duplicate attach, and last-owner protection

Step 11: Add client tests
Goal: lock request wiring and state transitions
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/actions/teamAction.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/reducers/teamReducer.test.js`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/pages/TeamDetails.test.js`
Changes:
- add collaboration action tests
- add reducer tests for collaborator state
- add page/component tests for owner vs assistant rendering paths where current test harness supports it
Done when:
- client tests cover collaboration fetch/mutate wiring and role-based UI branching

Step 12: Update architecture and rollout docs
Goal: keep system blueprint aligned with shipped permissions model
Files:
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/architecture.md`
- `/Users/hroman_codes/Documents/Code/highlander-react-redux/docs/plans/coach_collaboration_and_permissions_plan.md`
Changes:
- document collaboration endpoints, roles, and permission boundaries
Done when:
- architecture docs match implemented collaboration contract

## 12. Detected test framework and current test file conventions
- Framework: Jest via `react-scripts test`
- API tests currently live in `/Users/hroman_codes/Documents/Code/highlander-react-redux/src/server.test.js`
- Client tests are colocated as `*.test.js` beside actions, reducers, pages, and components

## 13. Recommended test convention
- Current convention exists; keep it.
- Standard:
  - colocated `*.test.js`
  - route/integration coverage in `src/server.test.js`
  - unit coverage beside action/reducer/component files

## Assumptions
- V1 collaboration is for existing coach accounts only.
- V1 roles are team-scoped and limited to `owner` and `assistant`.
- Read access remains broader than write access for collaborators.
- Team details is the intended initial management surface.
- Ordinary team/player/stat write operations are `owner+assistant`.
- Teams may currently have multiple owners.

## Unresolved questions that must be answered before implementation
- None required for the implemented v1 collaboration scope.
- Follow-up product questions, not blockers:
  - should teams be limited to exactly one owner in a future revision?
  - should collaboration move from coach-id attachment to an invitation flow?
  - should the client block invalid collaborator ids before dispatching route requests?
