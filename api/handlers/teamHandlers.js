"use strict";

const Bookshelf = require('../config/bookshelf.config');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Coaches = require('../models/Coach');
const Game = require('../models/Game');
const PlayerStat = require('../models/PlayerStat');
const Stat_Catalog = require('../models/Stat_Catalog');
const { addDerivedStatsToPlayers } = require('../utils/playerAnalytics');
const {
	getAuthenticatedCoachId,
	coachBelongsToTeam,
	coachIsTeamOwner,
	canSafelyRemoveCoachFromTeam,
	getCoachTeamRole,
	coachOwnsTeam
} = require('../utils/authorization');
const {
	parseRequestedSeason,
	parseOptionalFilterText,
	matchesCaseInsensitiveFilter,
	matchesOptionalPositionFilter,
	buildPlayerSearchText
} = require('../utils/filterQuery');

const ALLOWED_COACH_TEAM_ROLES = ['owner', 'assistant'];

function parseSeason(value) {
	const season = Number(value);

	if (!Number.isInteger(season)) {
		return null;
	}

	return season;
}

function parseTeamFilters(query) {
	const requestedSeason = parseRequestedSeason(query.season);
	if (requestedSeason.error) {
		return requestedSeason;
	}

	const playerSearch = parseOptionalFilterText(query.playerSearch, 'playerSearch');
	if (playerSearch.error) {
		return playerSearch;
	}

	const position = parseOptionalFilterText(query.position, 'position');
	if (position.error) {
		return position;
	}

	return {
		value: {
			season: requestedSeason.value,
			playerSearch: playerSearch.value,
			position: position.value,
			matchesPlayer: function(player) {
				return matchesCaseInsensitiveFilter(buildPlayerSearchText(player), playerSearch.value);
			},
			matchesPosition: function(player) {
				return matchesOptionalPositionFilter(player, position.value);
			}
		}
	};
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

function parseCoachTeamRole(value) {
	if (typeof value !== 'string') {
		return null;
	}

	const trimmedValue = value.trim();
	if (ALLOWED_COACH_TEAM_ROLES.indexOf(trimmedValue) === -1) {
		return null;
	}

	return trimmedValue;
}

function sanitizeCollaborator(coach) {
	return {
		id: coach.id,
		email: coach.email,
		first_name: coach.first_name,
		last_name: coach.last_name,
		role: coach.role || coach._pivot_role || null
	};
}

function addCollaborationMetadata(teamPayload, authenticatedCoachId) {
	teamPayload.collaborators = (teamPayload.coach || []).map(sanitizeCollaborator);
	teamPayload.currentCoachRole = getCoachTeamRole(teamPayload, authenticatedCoachId);
	return teamPayload;
}

function listTeams(req, res) {
	Team
		.fetchAll()
		.then(function(teams) {
			res.json(teams);
		});
}

function listTeamCoaches(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach'] })
		.then(function(team) {
			if (!team || !coachBelongsToTeam(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}

			const teamPayload = team.toJSON();
			return res.json((teamPayload.coach || []).map(sanitizeCollaborator));
		})
		.catch(function(err) {
			return next(err);
		});
}

function addTeamCoach(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	const postParams = ['coachId', 'role'];
	for (var i = 0; i < postParams.length; i++) {
		const requiredParam = postParams[i];
		if (!(requiredParam in req.body)) {
			const errorMessage = `Sorry your missing ${requiredParam} please try again`;
			console.error(errorMessage);
			return res.status(400).send(errorMessage);
		}
	}

	const targetCoachId = Number(req.body.coachId);
	if (!Number.isInteger(targetCoachId)) {
		return res.status(400).send('Sorry your coachId is invalid please try again');
	}

	const role = parseCoachTeamRole(req.body.role);
	if (role === null) {
		return res.status(400).send('Sorry your role is invalid please try again');
	}

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach'] })
		.then(function(team) {
			if (!team || !coachIsTeamOwner(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}

			const teamPayload = team.toJSON();
			const collaborators = teamPayload.coach || [];
			const alreadyAttached = collaborators.some(function(coach) {
				return Number(coach && coach.id) === targetCoachId;
			});
			if (alreadyAttached) {
				return res.status(400).send('Sorry this coach is already assigned to the team');
			}

			return Coaches
				.where({ id: targetCoachId })
				.fetch()
				.then(function(coach) {
					if (!coach) {
						return res.status(400).send('Sorry your coachId is invalid please try again');
					}

					const relation = team.coach();
					return relation
						.attach({
							coach_id: targetCoachId,
							role: role
						})
						.then(function() {
							const coachPayload = typeof coach.toJSON === 'function' ? coach.toJSON() : coach;
							return res.status(201).json(sanitizeCollaborator(Object.assign({}, coachPayload, {
								role: role
							})));
						});
				});
		})
		.catch(function(err) {
			return next(err);
		});
}

function updateTeamCoach(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	if (!('role' in req.body)) {
		return res.status(400).send('Sorry your missing role please try again');
	}

	const targetCoachId = Number(req.params.coachId);
	if (!Number.isInteger(targetCoachId)) {
		return res.status(400).send('Sorry your coachId is invalid please try again');
	}

	const role = parseCoachTeamRole(req.body.role);
	if (role === null) {
		return res.status(400).send('Sorry your role is invalid please try again');
	}

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach'] })
		.then(function(team) {
			if (!team || !coachIsTeamOwner(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}

			const teamPayload = team.toJSON();
			const collaborators = teamPayload.coach || [];
			const targetCoach = collaborators.find(function(coach) {
				return Number(coach && coach.id) === targetCoachId;
			});
			if (!targetCoach) {
				return res.status(400).send('Sorry your coachId is invalid please try again');
			}

			return team.coach()
				.updatePivot(
					{ role: role },
					{ query: { coach_id: targetCoachId }, require: true }
				)
				.then(function() {
					return res.status(200).json(sanitizeCollaborator(Object.assign({}, targetCoach, {
						role: role
					})));
				});
		})
		.catch(function(err) {
			return next(err);
		});
}

function deleteTeamCoach(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	const targetCoachId = Number(req.params.coachId);
	if (!Number.isInteger(targetCoachId)) {
		return res.status(400).send('Sorry your coachId is invalid please try again');
	}

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach'] })
		.then(function(team) {
			if (!team || !coachIsTeamOwner(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}

			const teamPayload = team.toJSON();
			const targetCoach = (teamPayload.coach || []).find(function(coach) {
				return Number(coach && coach.id) === targetCoachId;
			});
			if (!targetCoach) {
				return res.status(400).send('Sorry your coachId is invalid please try again');
			}
			if (!canSafelyRemoveCoachFromTeam(teamPayload, targetCoachId)) {
				return res.status(400).send('Sorry this coach cannot be removed from the team');
			}

			return team.coach()
				.detach([targetCoachId])
				.then(function() {
					return res.sendStatus(204);
				});
		})
		.catch(function(err) {
			return next(err);
		});
}

function getTeam(req, res, next) {
	/*
	 * Planned search/filter contract for GET /teams/:id:
	 * - extend the existing team details read endpoint only
	 * - keep the response shape additive and backward-compatible
	 * - supported optional query params:
	 *   - season
	 *   - playerSearch
	 *   - position
	 * - query param normalization rules:
	 *   - trim leading/trailing whitespace
	 *   - treat missing/empty values as "no filter"
	 *   - perform case-insensitive string matching for search values
	 *   - position remains a free-text filter based on current player data
	 * - validation rules:
	 *   - invalid season format may return 400
	 *   - valid filters with no matches should return 200 and an empty players
	 *     collection, not 404
	 * - response invariants when filters are added:
	 *   - preserve existing team, coach, derivedStats, availableSeasons, and
	 *     activeSeason fields
	 *   - only narrow the players/stats returned for this payload
	 *   - do not change auth requirements
	 */
	const parsedFilters = parseTeamFilters(req.query);
	if (parsedFilters.error) {
		return res.status(400).send(parsedFilters.error);
	}
	const authenticatedCoachId = getAuthenticatedCoachId(req);

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach', 'players', 'players.stats'] })
		.then(function(team) {
			if (!team || !coachOwnsTeam(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}
			const teamPayload = team.toJSON();
			const coachId = teamPayload.coach && teamPayload.coach[0] && teamPayload.coach[0].id;
			const teamFilters = parsedFilters.value;

			if (!coachId) {
				const availableSeasons = getAvailableSeasonsForTeamFamily(teamPayload);
				const activeSeason =
					teamFilters.season !== undefined
						? teamFilters.season
						: (availableSeasons[0] !== undefined ? availableSeasons[0] : null);

				teamPayload.players = addDerivedStatsToPlayers(teamPayload.players, activeSeason)
					.filter(function(player) {
						return teamFilters.matchesPlayer(player) &&
							teamFilters.matchesPosition(player);
					});
				addCollaborationMetadata(teamPayload, authenticatedCoachId);
				teamPayload.availableSeasons = availableSeasons;
				teamPayload.activeSeason = activeSeason;
				return res.json(teamPayload);
			}

			return Coaches
				.where({ id: coachId })
				.fetch({ withRelated: ['teams'] })
				.then(function(coach) {
					const coachPayload = coach.toJSON();
					const availableSeasons = getAvailableSeasonsForTeamFamily(
						teamPayload,
						coachPayload.teams
					);
					const requestedSeason = parsedFilters.value.season;
					const activeSeason =
						requestedSeason !== undefined
							? requestedSeason
							: (availableSeasons[0] !== undefined ? availableSeasons[0] : null);

					teamPayload.players = addDerivedStatsToPlayers(teamPayload.players, activeSeason)
						.filter(function(player) {
							return teamFilters.matchesPlayer(player) &&
								teamFilters.matchesPosition(player);
						});
					addCollaborationMetadata(teamPayload, authenticatedCoachId);
					teamPayload.availableSeasons = availableSeasons;
					teamPayload.activeSeason = activeSeason;

					return res.json(teamPayload);
				});
		})
		.catch(function(err) {
			return next(err);
		});
}

function updateTeam(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	const updateParams = ['name', 'city', 'state', 'season'];
	for (var i = 0; i < updateParams.length; i++) {
		const confirmedParams = updateParams[i];
		if (!(confirmedParams in req.body)) {
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

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach'] })
		.then(function(team) {
			if (!team || !coachBelongsToTeam(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}
			return team.save({
				name: req.body.name,
				city: req.body.city,
				state: req.body.state,
				season: season
			});
		})
		.then(function(team) {
			if (!team || team.headersSent) {
				return null;
			}
			return res.status(200).json(team);
		})
		.catch(function(err) {
			return next(err);
		});
}

function createTeam(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	const postParams = ['name', 'city', 'state', 'coachId', 'season'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmPostParams = postParams[i];
		if (!(confirmPostParams in req.body)) {
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

	if (Number(req.body.coachId) !== authenticatedCoachId) {
		return res.status(403).send('Unauthorized');
	}

	Coaches
		.where({ id: req.body.coachId })
		.fetch()
		.then(function(coach) {
			if (!coach) {
				const errorMessage = 'Sorry your coachId is invalid please try again';
				console.error(errorMessage);
				return res.status(400).send(errorMessage);
			}

			return Team
				.forge({
					name: req.body.name,
					city: req.body.city,
					state: req.body.state,
					season: season,
					game_date: new Date()
				})
				.save()
				.then(function(team) {
					return team.coach().attach({
						coach_id: Number(req.body.coachId),
						role: 'owner'
					})
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
}

function createTeamGame(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
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
		.fetch({ withRelated: ['coach', 'players'] })
		.then(function(team) {
			if (!team) {
				const errorMessage = 'Sorry your teamId is invalid please try again';
				console.error(errorMessage);
				return res.status(400).send(errorMessage);
			}
			if (!coachBelongsToTeam(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
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
}

function createTeamPlayer(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	const postParams = ['email', 'first_name', 'last_name', 'position'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmPostParams = postParams[i];
		if (!(confirmPostParams in req.body)) {
			const errorMessage = `Sorry your missing ${confirmPostParams} please try again`;
			console.error(errorMessage);
			return res.status(400).send(errorMessage);
		}
	}

	Team
		.where({ id: req.params.id })
		.fetch({ withRelated: ['coach'] })
		.then(function(team) {
			if (!team || !coachBelongsToTeam(team, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}

			return Player
				.forge({
					email: req.body.email,
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					position: req.body.position
				})
				.save()
				.then(function(player) {
					return player.teams().attach(req.params.id)
						.then(function() {
							return res.status(200).json(player);
						});
				});
		})
		.catch(function(err) {
			return next(err);
		});
}

module.exports = {
	listTeams,
	listTeamCoaches,
	addTeamCoach,
	updateTeamCoach,
	deleteTeamCoach,
	getTeam,
	updateTeam,
	createTeam,
	createTeamGame,
	createTeamPlayer
};
