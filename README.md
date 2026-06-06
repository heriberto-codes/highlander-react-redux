[![wakatime](https://wakatime.com/badge/user/3a78d911-a08a-40c2-bf2c-782c4d20eb23/project/500f18f9-dec6-4568-9d05-66f96de49281.svg)](https://wakatime.com/badge/user/3a78d911-a08a-40c2-bf2c-782c4d20eb23/project/500f18f9-dec6-4568-9d05-66f96de49281)

![Highlander](/public/assets/img/highlander_logo.png)

## Live Demo
Currently no live demo is available.

## Description
A simple app for coaches to manage their teams stats, averages, trash talk, and poach players from other teams.

Current MVP version omits :no_entry_sign:: </br>
- Poaching power :punch: </br>
- Trash talk  :speak_no_evil:

The dashboard now includes derived player analytics from existing stat totals, including batting average, home run rate, ERA, and strikeouts per inning.

The current UI also supports season-aware search and filtering on the dashboard and team details pages:
- dashboard: `teamSearch`, `playerSearch`, `position`, `season`
- team details: `playerSearch`, `position`, `season`

This rollout did not require a schema change. It extends the existing read endpoints with additive query params.

Want to keep up with the development and roadmap of Highlander?  https://trello.com/b/p1gqbNtQ/thinkful-capstone-highlander

## Setup

### Build the client
1. Install dependencies
   ```bash
   npm install
   ```
2. Create a production build
   ```bash
   npm run build
   ```

### Environment variables
Set the following variables in your shell or copy `.env.example` to `.env` before starting the server:

```
DATABASE_URL=postgresql://localhost/highlander-react-redux
CLIENT_ORIGIN=http://localhost:3000
SECRET=super-secret
PORT=8080
```

The server loads these values from the environment and, during local development, from a `.env` file via [dotenv](https://www.npmjs.com/package/dotenv).

On hosting platforms such as Heroku, configure the required variables with:

```
heroku config:set SECRET=your-secret DATABASE_URL=your-database-url CLIENT_ORIGIN=https://your-client-app
```

### Run database migrations
```bash
npm run migrate
npm run seed   # optional, populate sample data
```

`npm run migrate` creates the application tables and the `session` table required by `connect-pg-simple` for local/non-test login sessions. Run migrations before starting the server if login appears to succeed but session persistence fails.

The development coach seed creates bcrypt-compatible passwords for these sample accounts:

- `romanh99@gmail.com` / `highlander`
- `hroman@theknowledgehouse.org` / `highlander`

### Start the app
```bash
npm start
```

### Local registration and login behavior
- `/register` submits coach registration to `POST /api/v1/coaches`.
- Registration does not require an existing authenticated session, but it must come from the trusted `CLIENT_ORIGIN`.
- Successful registration returns only `id`, `email`, `first_name`, and `last_name`; password hashes are not returned.
- Successful registration redirects to `/login`. New coaches sign in through `POST /api/v1/sessions/login`.

### Troubleshooting
- **Heroku or similar platforms:**
  - Ensure `SECRET`, `DATABASE_URL`, and `CLIENT_ORIGIN` are configured with `heroku config:set`.
  - Run migrations on the remote instance with `heroku run npm run migrate`.
  - If the build fails, verify the Node.js buildpack is enabled and that `npm run build` succeeds locally before deploying.

## Requirements

- Node.js 14 or later

## Screenshots
![main page](/public/assets/img/highlander_home.png)

### Dashboard
![dashboard](/public/assets/img/highlander_dashboard.png)

### Add a Team

![add team](/public/assets/img/highlander_addteam.png)

### View List of Teams

![list of teams](/public/assets/img/highlander_listofteams.png)

### Add Player

![add players](/public/assets/img/highlander_addplayers.png)

### Add Stat

![add stat](/public/assets/img/highlander_addstat.png)

## Tech Stack

- DB: cloud-hosted PostgreSQL instance

- Server: Node, Express, Morgan, Knex, Bookshelf, Bcrypt

- Client: React, Redux, CSS, Bulma

# Database Structure
http://dbpatterns.com/documents/58c5ff7f1514b438af1a805e/

## Tables
#### `coaches`
 id  | email | first_name | last_name
:---:|:------|:----------:| :----------:
123 | isaac@gmail.com | Isaac | Brewman
124 | danny@yahoo.com | Danny | Guach

#### `coaches_teams`
coach_id | team_id
:-----:|:-----:
1 | 3
2 | 1
1 | 1

#### `teams`
id | name | city | state
:-----|:-----:|:-----:|:-----:
1 | Highlander | Bronx | NY
2 | Braves | Brooklyn | NY
3 | Brew Crew | Queens | NY

#### `teams_players`
team_id | player_id
:-----|:-----:
1 | 4
2 | 2
3 | 7

#### `players`
id | first_name | last_name | email | password | position
:-----|:-----:|:-----:|:-----:|:-----:|:-----:
1 | Ricardo | Roman | romanR@gmail.com | Bcrypt(hash) | 2nd base
2 | Randy | Brown | brown@yahoo.com | Bcrypt(hash) | Catcher
3 | Big | Mac | BG@yahoo.com | Bcrypt(hash) | 3rd base

#### `stats`
player_id | stat_catalog_id | how_many
-----|:-----:|:-----:
1 | 4 | 56
2 | 2 | 3  
3 | 6 | 24

#### `stat_catalogs`
id | description
-----|:-----:
1 | Hits
2 | At Bats
3 | Home Runs
4 | Earned Runs
5 | Innings Pitched
6 | Strikeouts

---

## Endpoints:

#### `coach`

- [x] router.get('/')
- [x] router.get('/:id')
  - optional query params: `season`, `teamSearch`, `playerSearch`, `position`

- [x] router.post('/')

- [x] router.put('/:id')

#### `session`

- [x] router.post('/login')
- [x] router.delete('/')

#### `player`

- [x] router.get('/')
- [x] router.get('/:id')
- [x] router.get('/:id/stats')

- [x] router.post('/')

- [x] router.post('/:player_id/stats/:stat_catalog_id')

- [x] router.put('/:player_id/stats/:stat_catalog_id')

#### `team`

- [x] router.get('/')
- [x] router.get('/:id')
  - optional query params: `season`, `playerSearch`, `position`

- [x] router.post('/')
- [x] router.post('/:id/player')

- [x] router.put('/:id')

#### `stat`

- [x] router.get('/')
- [x] router.get('/:id')
