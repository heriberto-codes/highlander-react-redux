# Architecture

## Overview
Highlander is a monolithic Node/Express application with a React/Redux client. The server exposes a REST API and serves the built client from `build/` for production. The client can also run via the React dev server for local development.

## Runtime Components
- **Server**: Express app in `server.js`, API routes in `api/routes/`
- **Client**: React app in `src/`, bundled by `react-scripts`
- **Database**: PostgreSQL accessed via Knex + Bookshelf

## Key Dependencies
- **Server Framework**: `express`, `body-parser`, `cors`, `helmet`, `morgan`
- **Authentication/Session**: `express-session`, `connect-pg-simple`, `bcrypt`
- **Database/ORM**: `pg`, `knex`, `bookshelf`
- **Client Framework**: `react`, `react-dom`, `react-scripts`
- **State Management**: `redux`, `react-redux`, `redux-thunk`, `redux-form`, `redux-logger`
- **Routing and HTTP**: `react-router-dom`, `axios`

## Request Flow
1. Browser requests pages or API.
2. Express serves static assets from `public/` and `build/`.
3. API routes handle `/players`, `/teams`, `/coaches`, `/stats`, `/sessions` and perform DB operations.
4. Client uses Axios to call API endpoints and updates Redux store.

## Data Flow
React client → Express API → PostgreSQL

Additional flows:
- React dev server → Express API → PostgreSQL (local development)
- Express → static assets (`public/`, `build/`) → Browser

## Data Layer
- **Knex** handles migrations and query building.
- **Bookshelf** is the ORM on top of Knex.
- Migrations: `data/migrations/`
- Seeds: `data/seeds/`

## Client Architecture
- **State**: Redux store in `src/store.js`
- **Reducers**: `src/reducers/`
- **Actions**: `src/actions/`
- **Pages**: `src/pages/`
- **Shared Components**: `src/components/`

## Server Architecture
- **Entry**: `server.js`
- **Routes**: `api/routes/*Router.js`
- **Config**: `config.js`, `knexfile.js`

## API Structure
Base paths are mounted in `server.js` (no `/api` prefix):
- `POST /sessions/login` (login)
- `DELETE /sessions` (logout)
- `GET /coaches` (list coaches, requires session)
- `GET /coaches/:id` (coach by id)
- `POST /coaches` (create coach, auth required)
- `PUT /coaches/:id` (update coach, auth required)
- `GET /teams` (list teams)
- `GET /teams/:id` (team by id, includes coach + players)
- `POST /teams` (create team, auth required)
- `PUT /teams/:id` (update team, auth required)
- `POST /teams/:id/player` (add player to team, auth required)
- `GET /players` (list players)
- `GET /players/:id` (player by id)
- `GET /players/:id/stats` (player stats)
- `POST /players` (create player, auth required)
- `PUT /players/:id` (update player, auth required)
- `POST /players/:player_id/stats/:stat_catalog_id` (add stat, auth required)
- `PUT /players/:player_id/stats/:stat_catalog_id` (update stat, auth required)
- `DELETE /players/:id` (delete player, auth required)
- `GET /stats` (list stat catalog)
- `GET /stats/:id` (stat catalog by id)

## Authentication
- Session-based auth via `express-session`, stored in Postgres with `connect-pg-simple`.
- Login: `POST /sessions/login` creates a session; logout: `DELETE /sessions` destroys it.
- Protected routes use `ensureAuthenticated` middleware.

## Background Tasks
- No dedicated background jobs or workers are defined.
- All work is request/response driven.

## Build and Run
- **Install**: `npm install`
- **Build**: `npm run build` (creates `build/`)
- **Server**: `npm start` (Express + static client)
- **Client Dev**: `npm run client` (hot reload)
- **DB Migrate**: `npm run migrate`
- **DB Seed**: `npm run seed`

## Environment Configuration
Required variables (see `.env.example`):
- `DATABASE_URL`
- `CLIENT_ORIGIN`
- `SECRET`
- `PORT`

## Database Schema (High Level)
- `coaches`
- `teams`
- `players`
- `stat_catalogs`
- `players_stat_catalogs`
- `players_teams`
- `coaches_teams`

## Deployment
- Build client: `npm run build`
- Run server with env vars set
- Express serves `build/` in production
