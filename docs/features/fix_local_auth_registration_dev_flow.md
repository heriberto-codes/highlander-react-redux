# Fix Local Auth and Registration Dev Flow

## Summary

- Added the PostgreSQL session table required by `connect-pg-simple` in non-test environments.
- Updated development coach seeds to store bcrypt-compatible password hashes.
- Enabled unauthenticated coach registration through `POST /api/v1/coaches` while retaining trusted-origin protection.
- Added a working `/register` form that submits coach details, displays local progress and error states, and redirects successful registrations to `/login`.
- Documented local migration, seeded login, and registration behavior.

## Architecture Impact

- Non-test sessions continue using `connect-pg-simple`, now backed by an explicit Knex migration.
- Registration remains in the existing coach route and handler boundary.
- Registration submission uses the existing client action module and a relative `/api/v1/coaches` URL with credentials.
- Registration request state remains local to `RegisterForm`; no registration-specific Redux state was added.

## Decisions

- Registration creates an account without requiring an existing authenticated session.
- `requireTrustedOrigin` remains required for registration.
- Successful registration does not create a session automatically; the client redirects to `/login`.
- Registration responses expose only `id`, `email`, `first_name`, and `last_name`.
- Existing authenticated coach read and update routes remain protected.

## API Changes

- `POST /api/v1/coaches`
  - No longer requires `ensureAuthenticated`.
  - Still requires a trusted `Origin` or `Referer`.
  - Hashes the submitted password before saving.
  - Returns a sanitized coach identity payload without password data.

## Database Changes

- Added `data/migrations/20260603000000_create_session_table.js`.
- The migration creates:
  - `sid` as the primary key.
  - `sess` as required JSON session data.
  - `expire` as a required timestamp.
  - `IDX_session_expire` on `expire`.
- The migration is reversible by dropping the `session` table.
- Development coach seeds now hash the shared local password `highlander` with bcrypt before insertion.

## Test Impact

- Added migration coverage for session table creation and rollback.
- Added seed coverage for bcrypt hashing, preserved coach identities, and hash failure behavior.
- Added registration API coverage for:
  - trusted-origin unauthenticated success;
  - untrusted-origin rejection;
  - missing-field validation;
  - password exclusion;
  - continued protection of coach reads.
- Added action coverage for the relative registration endpoint and credentials.
- Added form and page coverage for field entry, submitting state, success/error feedback, payload forwarding, and redirect to `/login`.
- Focused Jest validation passed: 5 suites and 160 tests.
- `npm run lint` passed with warnings and no errors.
- `npm run build` completed successfully with warnings.

## Deployment Notes

- Run `npm run migrate` before starting a non-test server so the session table exists.
- Configure `DATABASE_URL`, `CLIENT_ORIGIN`, `SECRET`, and `PORT`.
- Production session cookies remain secure, HTTP-only, and strict same-site.

## Follow-ups / Accepted Risks

- Public registration has no registration-specific rate limiting; repeated requests can consume bcrypt CPU and database writes.
- Server validation currently checks field presence but does not enforce trimmed non-empty values, email format, or password strength.
- `coaches.email` has no unique index, allowing duplicate accounts and unindexed login lookup.
- These are accepted follow-up hardening items and were not part of the completed feature plan.
