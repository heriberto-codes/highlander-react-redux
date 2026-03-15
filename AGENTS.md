# Repository Guidelines

## Project Overview
This is a React and Node.js application

## Project Structure & Module Organization
- `src/` holds the React client (pages, components, Redux actions/reducers, `store.js`).
- `server.js` is the Express entry point; API routes live in `api/routes/`.
- `public/` contains static assets (images, icons) and the HTML shell.
- `build/` is the production client build output.
- `data/` and `highlander-react-redux-db.sql` contain seed/reference data.
- `docs/` and `MVC.md` document architecture and design notes.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run client` starts the React dev server (hot reload).
- `npm start` starts the Express server (serves API + static client when built).
- `npm run build` creates the production client in `build/`.
- `npm test` runs Jest via `react-scripts`.
- `npm run lint` runs ESLint across the repo.
- `npm run migrate` and `npm run seed` manage the PostgreSQL schema and sample data.

## Coding Style & Naming Conventions
- JavaScript uses 2-space indentation and semicolons.
- Prefer `camelCase` for variables/functions and `PascalCase` for React components.
- Keep API routes in `api/routes/*Router.js` and client pages in `src/pages/`.
- Run `npm run lint` before pushing if you touch JS/JSX.

## Testing Guidelines
- Tests run with Jest (`react-scripts test`) and use `supertest` for API checks.
- Keep tests alongside code when practical (example: `src/server.test.js`).
- Name tests `*.test.js` and target key routes or components you changed.

## Commit & Pull Request Guidelines
- Recent history uses Conventional Commit-style messages (e.g., `feat: ...`).
- PRs should include: concise summary, testing notes (`npm test`, `npm run lint`), and screenshots for UI changes.
- Link related issues or tasks when applicable.

## Configuration & Environment
- Local configuration relies on `.env` (see `.env.example`). Required: `DATABASE_URL`, `CLIENT_ORIGIN`, `SECRET`, `PORT`.
- For production (e.g., Heroku), set these via environment config rather than committing secrets.

## Security
- Never expose API keys.
- Validate all user input.

## Conventions
- Follow existing repository structure.
- Prefer simple solutions over complex abstractions.

## Architecture Safety
- Preserve API and data contracts unless explicitly changing them.
- Document architectural changes in `architecture.md`.
- Keep migrations backward-compatible when possible.
