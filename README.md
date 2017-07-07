![Highlander](/public/assets/img/highlander_logo.png)
<!-- [![Build Status](https://travis-ci.org/iamromanh/highlander.svg?branch=master)](https://travis-ci.org/iamromanh/highlander) -->

## Live Demo
Link: Coming soon!

## Description
A simple app for coaches to manage their teams stats, averages, trash talk, and poach players from other teams.

Current MVP version omits :no_entry_sign:: </br>
- Poaching power :punch: </br>
- Player averages :bar_chart: </br>
- Trash talk  :speak_no_evil:

Want to keep up with the development and roadmap of Highlander?  https://trello.com/b/p1gqbNtQ/thinkful-capstone-highlander

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
1  | 3
2  | 1
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

- [x] router.post('/')

- [x] router.post('/login')

- [x] router.put('/:id')

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

- [x] router.post('/')
- [x] router.post('/:id/player')

- [x] router.put('/:id')

#### `stat`

- [x] router.get('/')
- [x] router.get('/:id')
