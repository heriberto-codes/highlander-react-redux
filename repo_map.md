# Repository Navigation Map

## Top-Level
- `AGENTS.md` — repository guidelines
- `README.md` — setup, environment, and usage
- `architecture.md` — system architecture overview
- `config.js` — runtime configuration wiring
- `knexfile.js` — Knex configuration
- `server.js` — Express server entry
- `package.json` / `package-lock.json` — dependencies and scripts
- `.env.example` — environment variable template

## Client (React)
- `src/` — React application source
- `src/index.js` — client entry
- `src/store.js` — Redux store setup
- `src/actions/` — Redux action creators
- `src/reducers/` — Redux reducers
- `src/pages/` — page-level components
- `src/components/` — shared UI components
- `src/container/` — app container and routing
- `src/css/` — CSS styles
- `src/assets/` — client-bundled assets
- `public/` — static assets and HTML shell

## Server (API)
- `api/routes/` — route handlers
  - `coachRouter.js` — `/coaches`
  - `playerRouter.js` — `/players`
  - `teamRouter.js` — `/teams`
  - `statRouter.js` — `/stats`
  - `sessionRouter.js` — `/sessions`
- `api/models/` — Bookshelf models (domain entities)
- `api/middleware/` — request middleware

## Data
- `data/migrations/` — Knex migrations
- `data/seeds/` — Knex seeds
- `highlander-react-redux-db.sql` — reference SQL

## Build Output
- `build/` — production client build output

## Documentation
- `MVC.md` — architecture/design notes
- `reactcomponentprototype.md` — prototype notes

## Protected Paths (Do Not Modify)
- `AGENTS.md` — repository-level instructions and guardrails
- `architecture.md` — architecture source of truth
- `repo_map.md` — repository navigation index
- `node_modules/`
- `build/`
- `dist/`
- `migrations/` (unless explicitly requested)
- `.env` files
