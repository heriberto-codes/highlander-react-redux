const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Bookshelf = require('../config/bookshelf.config');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Coaches = require('../models/Coach');
const Game = require('../models/Game');
const PlayerStat = require('../models/PlayerStat');
const Stat_Catalog = require('../models/Stat_Catalog');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const { addDerivedStatsToPlayers } = require('../utils/playerAnalytics');

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

/*
 * Planned game-based stat entry contract for /teams routes:
 * - add a create-only team-scoped write path: POST /teams/:id/games
 * - v1 persists a first-class game record with:
 *   - team_id
 *   - opponent
 *   - game_date
 * - request body shape:
 *   - opponent
 *   - game_date
 *   - playerStats: [{ playerId, stats: [{ statCatalogId, howMany }] }]
 * - server responsibilities:
 *   - validate authenticated access
 *   - validate target team exists
 *   - validate submitted players belong to the target team
 *   - validate submitted stat catalog ids exist
 *   - create one game row, then one stat row per non-zero submitted stat
 * - persistence rules:
 *   - created stat rows will store both game_id and game_date
 *   - legacy direct stat routes remain supported, but are no longer the
 *     primary v1 stat-entry path
 */

function parseSeason(value) {
	const season = Number(value);

	if (!Number.isInteger(season)) {
		return null;
	}

	return season;
}

function parseRequestedSeason(value) {
	if (value === undefined) {
		return undefined;
	}

	const season = parseSeason(value);
	return season === null ? undefined : season;
}

function getAvailableSeasonsForTeamFamily(teamPayload, coachTeams) {
	const fallbackTeams = teamPayload && Number.isInteger(teamPayload.season) ? [teamPayload] : [];
	const familyTeams = (coachTeams || fallbackTeams).filter(function(team) {
		return team && team.name === teamPayload.name && Number.isInteger(team.season);
	});

	return Array.from(
		new Set(
			familyTeams.map(function(team) {
				return team.season;
			})
		)
	).sort(function(left, right) {
		return right - left;
	});
}

function parseGameDate(value) {
	const date = new Date(value);

	if (!value || Number.isNaN(date.getTime())) {
		return null;
	}

	return date;
}

function parseNonNegativeInteger(value) {
	const parsedValue = Number(value);

	if (!Number.isInteger(parsedValue) || parsedValue < 0) {
		return null;
	}

	return parsedValue;
}

function collectGameStatRows(playerStats) {
	const statRows = [];

	for (var i = 0; i < playerStats.length; i++) {
		const playerStat = playerStats[i];

		if (!playerStat || !Number.isInteger(Number(playerStat.playerId)) || !Array.isArray(playerStat.stats)) {
			return null;
		}

		for (var j = 0; j < playerStat.stats.length; j++) {
			const stat = playerStat.stats[j];

			if (!stat || !Number.isInteger(Number(stat.statCatalogId))) {
				return null;
			}

			const howMany = parseNonNegativeInteger(stat.howMany);
			if (howMany === null) {
				return null;
			}

			if (howMany === 0) {
				continue;
			}

			statRows.push({
				player_id: Number(playerStat.playerId),
				stat_catalog_id: Number(stat.statCatalogId),
				how_many: howMany
			});
		}
	}

	return statRows;
}

router.get('/', function(req, res) {
	Team
		.fetchAll()
		.then(function(teams) {
			res.json(teams);
		});
});


router.get('/:id', function(req, res, next) {
	Team
		.where({id: req.params.id})
               .fetch({withRelated: ['coach', 'players', 'players.stats']})
               .then(function(team) {
                        const teamPayload = team.toJSON();
                        const coachId = teamPayload.coach && teamPayload.coach[0] && teamPayload.coach[0].id;

                        if (!coachId) {
                                const availableSeasons = getAvailableSeasonsForTeamFamily(teamPayload);
                                const activeSeason =
                                        parseRequestedSeason(req.query.season) !== undefined
                                                ? parseRequestedSeason(req.query.season)
                                                : (availableSeasons[0] !== undefined ? availableSeasons[0] : null);

                                teamPayload.players = addDerivedStatsToPlayers(teamPayload.players, activeSeason);
                                teamPayload.availableSeasons = availableSeasons;
                                teamPayload.activeSeason = activeSeason;
                                return res.json(teamPayload);
                        }

                        return Coaches
                                .where({id: coachId})
                                .fetch({withRelated: ['teams']})
                                .then(function(coach) {
                                        const coachPayload = coach.toJSON();
                                        const availableSeasons = getAvailableSeasonsForTeamFamily(
                                                teamPayload,
                                                coachPayload.teams
                                        );
                                        const requestedSeason = parseRequestedSeason(req.query.season);
                                        const activeSeason =
                                                requestedSeason !== undefined
                                                        ? requestedSeason
                                                        : (availableSeasons[0] !== undefined ? availableSeasons[0] : null);

                                        teamPayload.players = addDerivedStatsToPlayers(teamPayload.players, activeSeason);
                                        teamPayload.availableSeasons = availableSeasons;
                                        teamPayload.activeSeason = activeSeason;

                                        return res.json(teamPayload);
                                });
               });
});

router.put('/:id', ensureAuthenticated, function(req, res, next) {
	// check to see if the proper params is equal to what the user is inputting
	const updateParams = ['name', 'city', 'state', 'season'];
	for(var i = 0; i < updateParams.length; i++) {
		const confirmedParams = updateParams[i];
		if(!(confirmedParams in req.body)) {
			const errorMessage = `Sorry your missing ${confirmedParams} please try again`;
			console.error(errorMessage);
			return res.status(400).send(errorMessage);
		}
	}

	const season = parseSeason(req.body.season);
	if (season === null) {
		const errorMessage = 'Sorry your season is invalid please try again';
		console.error(errorMessage);
		return res.status(400).send(errorMessage);
	}

	// update query db via model with new params
	Team
		.where({id: req.params.id})
		.fetch()
		.then(function(team) {
			return team.save({
				name: req.body.name,
				city: req.body.city,
				state: req.body.state,
				season
			});
		})
		.then(function(team) {
			return res.status(200).json(team);
		})
		.catch(function(err) {
			return next(err);
		});
});


router.post('/', ensureAuthenticated, function(req, res, next) {
        const postParams = ['name', 'city', 'state', 'coachId', 'season'];
        for (var i = 0; i < postParams.length; i++) {
                const confirmPostParams = postParams[i];
                if(!(confirmPostParams in req.body)) {
                        const errorMessage = `Sorry your missing ${confirmPostParams} please try again`;
                        console.error(errorMessage);
                        return res.status(400).send(errorMessage);
                }
        }

        const season = parseSeason(req.body.season);
        if (season === null) {
                const errorMessage = 'Sorry your season is invalid please try again';
                console.error(errorMessage);
                return res.status(400).send(errorMessage);
        }

        Coaches
                .where({id: req.body.coachId})
                .fetch()
                .then(function(coach) {
                        if(!coach) {
                                const errorMessage = `Sorry your coachId is invalid please try again`;
                                console.error(errorMessage);
                                return res.status(400).send(errorMessage);
                        }

                        return Team
                                .forge({
                                        name: req.body.name,
                                        city: req.body.city,
                                        state: req.body.state,
                                        season,
                                        game_date: new Date()
                                })
                                .save()
                                .then(function(team) {
                                        return team.coach().attach(req.body.coachId)
                                                .then(function() {
                                                        return team;
                                                });
                                })
                                .then(function(team) {
                                        return res.status(200).json(team);
                                });
                })
                .catch(function(err) {
                        return next(err);
                });
});

router.post('/:id/games', ensureAuthenticated, function(req, res, next) {
	const postParams = ['opponent', 'game_date', 'playerStats'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmedParam = postParams[i];
		if (!(confirmedParam in req.body)) {
			const errorMessage = `Sorry your missing ${confirmedParam} please try again`;
			console.error(errorMessage);
			return res.status(400).send(errorMessage);
		}
	}

	const gameDate = parseGameDate(req.body.game_date);
	if (gameDate === null) {
		const errorMessage = 'Sorry your game_date is invalid please try again';
		console.error(errorMessage);
		return res.status(400).send(errorMessage);
	}

	if (typeof req.body.opponent !== 'string' || req.body.opponent.trim() === '') {
		const errorMessage = 'Sorry your opponent is invalid please try again';
		console.error(errorMessage);
		return res.status(400).send(errorMessage);
	}

	if (!Array.isArray(req.body.playerStats) || req.body.playerStats.length === 0) {
		const errorMessage = 'Sorry your playerStats are invalid please try again';
		console.error(errorMessage);
		return res.status(400).send(errorMessage);
	}

	const statRows = collectGameStatRows(req.body.playerStats);
	if (!statRows || statRows.length === 0) {
		const errorMessage = 'Sorry your playerStats are invalid please try again';
		console.error(errorMessage);
		return res.status(400).send(errorMessage);
	}

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['players'] })
		.then(function(team) {
			if (!team) {
				const errorMessage = 'Sorry your teamId is invalid please try again';
				console.error(errorMessage);
				return res.status(400).send(errorMessage);
			}

			const teamPayload = team.toJSON();
			const teamPlayerIds = new Set((teamPayload.players || []).map(function(player) {
				return player.id;
			}));
			const requestedPlayerIds = Array.from(
				new Set(
					statRows.map(function(statRow) {
						return statRow.player_id;
					})
				)
			);

			const hasInvalidPlayer = requestedPlayerIds.some(function(playerId) {
				return !teamPlayerIds.has(playerId);
			});

			if (hasInvalidPlayer) {
				const errorMessage = 'Sorry your playerId is invalid please try again';
				console.error(errorMessage);
				return res.status(400).send(errorMessage);
			}

			const requestedStatCatalogIds = Array.from(
				new Set(
					statRows.map(function(statRow) {
						return statRow.stat_catalog_id;
					})
				)
			);

			return Promise.all(
				requestedStatCatalogIds.map(function(statCatalogId) {
					return Stat_Catalog.where({ id: statCatalogId }).fetch();
				})
			)
				.then(function(statCatalogs) {
					const hasMissingStatCatalog = statCatalogs.some(function(statCatalog) {
						return !statCatalog;
					});

					if (hasMissingStatCatalog) {
						const errorMessage = 'Sorry your statCatalogId is invalid please try again';
						console.error(errorMessage);
						return res.status(400).send(errorMessage);
					}

					return Bookshelf.transaction(function(transaction) {
						return Game
							.forge({
								team_id: Number(req.params.id),
								opponent: req.body.opponent.trim(),
								game_date: gameDate
							})
							.save(null, { transacting: transaction })
							.then(function(game) {
								return Promise.all(
									statRows.map(function(statRow) {
										return PlayerStat
											.forge(Object.assign({}, statRow, {
												game_id: game.id,
												game_date: gameDate
											}))
											.save(null, { transacting: transaction });
									})
								)
									.then(function(savedStatRows) {
										return {
											id: game.id,
											team_id: Number(req.params.id),
											opponent: req.body.opponent.trim(),
											game_date: gameDate,
											insertedStatRows: savedStatRows.length
										};
									});
							});
					})
						.then(function(responsePayload) {
							return res.status(201).json(responsePayload);
						});
				});
		})
		.catch(function(err) {
			return next(err);
		});
});


router.post('/:id/player', ensureAuthenticated, function(req, res) {
  const postParams = ['email', 'first_name', 'last_name', 'position']
  for (var i = 0; i < postParams.length; i++) {
    const confirmPostParams = postParams[i];
    if(!(confirmPostParams in req.body)) {
      const errorMessage = `Sorry your missing ${confirmPostParams} please try again`
      console.error(errorMessage);
      return res.status(400).send(errorMessage);
    }
  }

  Player
  .forge({
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    position: req.body.position
  })
  .save()
  .then(function(player) {
    player.teams().attach(req.params.id)
    return res.status(200).json(player)
  })
  .catch(function(err) {
    return next(err)
  })
})


module.exports = router;
