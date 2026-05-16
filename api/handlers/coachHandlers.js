'use strict';

const Coach = require('../models/Coach');
const { addDerivedStatsToCoachPayload, addDerivedStatsToPlayers } = require('../utils/playerAnalytics');
const { getAuthenticatedCoachId } = require('../utils/authorization');
const {
	normalizeNotificationPayload,
	buildDueUpcomingGameNotifications
} = require('../utils/notifications');
const {
	parseRequestedSeason,
	parseOptionalFilterText,
	matchesCaseInsensitiveFilter,
	matchesOptionalPositionFilter,
	buildPlayerSearchText,
	parsePaginationQuery,
	paginateItems
} = require('../utils/filterQuery');
const {
	sendForbiddenError,
	sendNotFoundError,
	sendValidationError
} = require('../utils/apiErrors');

function sendMissingFieldError(res, field) {
	return sendValidationError(res, `Sorry your missing ${field} please try again`);
}

function parseDashboardFilters(query) {
	const requestedSeason = parseRequestedSeason(query.season);
	if (requestedSeason.error) {
		return requestedSeason;
	}

	const teamSearch = parseOptionalFilterText(query.teamSearch, 'teamSearch');
	if (teamSearch.error) {
		return teamSearch;
	}

	const playerSearch = parseOptionalFilterText(query.playerSearch, 'playerSearch');
	if (playerSearch.error) {
		return playerSearch;
	}

	const position = parseOptionalFilterText(query.position, 'position');
	if (position.error) {
		return position;
	}

	const teamPagination = parsePaginationQuery(query, {
		pageKey: 'teamPage',
		limitKey: 'teamLimit'
	});
	if (teamPagination.error) {
		return teamPagination;
	}

	const playerPagination = parsePaginationQuery(query, {
		pageKey: 'playerPage',
		limitKey: 'playerLimit'
	});
	if (playerPagination.error) {
		return playerPagination;
	}

	const notificationPagination = parsePaginationQuery(
		{ notificationLimit: query.notificationLimit },
		{
			pageKey: 'notificationPage',
			limitKey: 'notificationLimit'
		}
	);
	if (notificationPagination.error) {
		return notificationPagination;
	}

	return {
		value: {
			season: requestedSeason.value,
			teamSearch: teamSearch.value,
			playerSearch: playerSearch.value,
			position: position.value,
			teamPagination: teamPagination.value,
			playerPagination: playerPagination.value,
			notificationPagination: notificationPagination.value,
			matchesTeam: function(team) {
				return matchesCaseInsensitiveFilter(team && team.name, teamSearch.value);
			},
			matchesPlayer: function(player) {
				return matchesCaseInsensitiveFilter(buildPlayerSearchText(player), playerSearch.value);
			},
			matchesPosition: function(player) {
				return matchesOptionalPositionFilter(player, position.value);
			}
		}
	};
}

function getAvailableSeasons(teams) {
	return Array.from(
		new Set(
			(teams || [])
				.map(function(team) {
					return team.season;
				})
				.filter(function(season) {
					return Number.isInteger(season);
				})
		)
	).sort(function(left, right) {
		return right - left;
	});
}

function sortDashboardNotifications(notifications) {
	return (notifications || []).slice().sort(function(left, right) {
		const leftDate = left && left.scheduled_for ? new Date(left.scheduled_for).getTime() : 0;
		const rightDate = right && right.scheduled_for ? new Date(right.scheduled_for).getTime() : 0;

		return rightDate - leftDate;
	});
}

function listCoaches(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);

	Coach
		.where({ id: authenticatedCoachId })
		.fetch()
		.then(function(coach) {
			if (!coach) {
				return sendNotFoundError(res, 'Coach not found');
			}

			res.json([coach.toJSON()]);
		})
		.catch(function(err) {
			return next(err);
		});
}

function getCoachProfile(req, res, next) {
        /*
         * Planned dashboard analytics contract for GET /coaches/:id:
         * - keep the existing coach/team/player payload unchanged
         * - add player.derivedStats as an additive field only
         * - v1 fields:
         *   - battingAverage
         *   - homeRunRate
         *   - era
         *   - strikeoutsPerInning
         * - values should be numeric or null when the denominator/missing data
         *   prevents a valid calculation
         * - excluded from v1 because the current stat catalog does not support
         *   them correctly: OBP, SLG, OPS, RBI, walks-based metrics, doubles,
         *   triples, and team-level leaderboards
         *
         * Planned search/filter contract for GET /coaches/:id:
         * - extend the existing read endpoint only; do not add a new endpoint
         * - keep the response shape additive and backward-compatible
         * - supported optional query params:
         *   - season
         *   - teamSearch
         *   - playerSearch
         *   - position
         * - query param normalization rules:
         *   - trim leading/trailing whitespace
         *   - treat missing/empty values as "no filter"
         *   - perform case-insensitive string matching for search values
         *   - position remains a free-text filter based on current player data
         * - validation rules:
         *   - invalid season format may return 400
         *   - valid filters with no matches should return 200 and empty result
         *     collections, not 404
         * - response invariants when filters are added:
         *   - preserve top-level coach fields
         *   - preserve availableSeasons and activeSeason contract
         *   - only narrow teams/players/stats returned for this payload
         *   - do not change auth requirements
         *
         * Planned notifications/reminders contract for coach-owned resources:
         * - v1 is in-app only; no email, SMS, push, cron, or worker delivery
         * - planned additive read contract on GET /coaches/:id:
         *   - notifications
         *   - unreadNotificationCount
         * - planned dedicated routes:
         *   - GET /coaches/:id/notifications
         *   - PUT /coaches/:id/notifications/:notificationId
         * - ownership rules:
         *   - authenticated coach id must match req.params.id
         *   - coach may read/mutate only own notifications
         * - planned state model:
         *   - unread
         *   - read
         *   - dismissed
         * - planned reminder source:
         *   - existing games.game_date only
         *   - upcoming-game reminders only in v1
         * - generation rules:
         *   - request-driven, not background scheduled
         *   - additive to current payload shape
         *   - idempotent for the same coach/team/game/reminder window
         */
        const parsedFilters = parseDashboardFilters(req.query);
        if (parsedFilters.error) {
                return sendValidationError(res, parsedFilters.error);
        }
        const authenticatedCoachId = getAuthenticatedCoachId(req);
        if (authenticatedCoachId === null || authenticatedCoachId !== Number(req.params.id)) {
                return sendForbiddenError(res, 'Unauthorized');
        }

        Coach
                .where({id: req.params.id})
                .fetch({withRelated: ['teams', 'teams.players', 'teams.players.stats', 'teams.games', 'notifications']})
                .then(function(coaches) {
                        const coachPayload = addDerivedStatsToCoachPayload(coaches);
                        const existingNotifications = (coachPayload.notifications || [])
                                .map(normalizeNotificationPayload)
                                .filter(Boolean);
                        const existingNotificationKeys = new Set(
                                existingNotifications
                                        .map(function(notification) {
                                                return notification.idempotency_key;
                                        })
                                        .filter(Boolean)
                        );
                        const dueNotifications = buildDueUpcomingGameNotifications(coachPayload).filter(function(notification) {
                                return !existingNotificationKeys.has(notification.idempotency_key);
                        });
                        const availableSeasons = getAvailableSeasons(coachPayload.teams);
                        const requestedSeason = parsedFilters.value.season;
                        const dashboardFilters = parsedFilters.value;
                        const activeSeason =
                                requestedSeason !== undefined
                                        ? requestedSeason
                                        : (availableSeasons[0] !== undefined ? availableSeasons[0] : null);

                        const teams =
                                activeSeason === null
                                        ? coachPayload.teams
                                        : (coachPayload.teams || []).filter(function(team) {
                                                return team.season === activeSeason;
                                        });
                        const notifications = sortDashboardNotifications(
                                existingNotifications
                                        .concat(dueNotifications)
                                        .filter(function(notification) {
                                                return !notification.dismissed_at;
                                        })
                        );

                        const filteredTeams = teams
                                .filter(function(team) {
                                        return dashboardFilters.matchesTeam(team);
                                })
                                .map(function(team) {
                                        const seasonScopedPlayers = addDerivedStatsToPlayers(team.players, activeSeason);
                                        const filteredPlayers = seasonScopedPlayers.filter(function(player) {
                                                return dashboardFilters.matchesPlayer(player) &&
                                                        dashboardFilters.matchesPosition(player);
                                        });

                                        return Object.assign({}, team, {
                                                players: filteredPlayers
                                        });
                                });
                        const filteredTeamEntries = filteredTeams.map(function(team, teamIndex) {
                                return {
                                        teamIndex: teamIndex,
                                        team: team
                                };
                        });
                        const filteredPlayerEntries = [];
                        filteredTeamEntries.forEach(function(entry) {
                                (entry.team.players || []).forEach(function(player) {
                                        filteredPlayerEntries.push({
                                                teamIndex: entry.teamIndex,
                                                player: player
                                        });
                                });
                        });
                        const paginatedTeamEntries = paginateItems(
                                filteredTeamEntries,
                                dashboardFilters.teamPagination
                        );
                        const paginatedPlayerEntries = paginateItems(
                                filteredPlayerEntries,
                                dashboardFilters.playerPagination
                        );
                        const playersByTeamIndex = {};
                        paginatedPlayerEntries.items.forEach(function(entry) {
                                if (!playersByTeamIndex[entry.teamIndex]) {
                                        playersByTeamIndex[entry.teamIndex] = [];
                                }

                                playersByTeamIndex[entry.teamIndex].push(entry.player);
                        });
                        const teamsWithPaginatedPlayers = paginatedTeamEntries.items.map(function(entry) {
                                const teamPlayers = playersByTeamIndex[entry.teamIndex] || [];

                                return Object.assign({}, entry.team, {
                                        players: teamPlayers
                                });
                        });
                        const paginatedNotifications = paginateItems(
                                notifications,
                                dashboardFilters.notificationPagination
                        );

                        coachPayload.teams = teamsWithPaginatedPlayers;
                        coachPayload.teamPagination = paginatedTeamEntries.pagination;
                        coachPayload.playerPagination = paginatedPlayerEntries.pagination;
                        coachPayload.availableSeasons = availableSeasons;
                        coachPayload.activeSeason = activeSeason;
                        coachPayload.notifications = paginatedNotifications.items;
                        coachPayload.notificationPagination = paginatedNotifications.pagination;
                        coachPayload.unreadNotificationCount = notifications.filter(function(notification) {
                                return !notification.read_at && !notification.dismissed_at;
                        }).length;

                        res.json(coachPayload);
                })
                .catch(function(err) {
                        return next(err);
                });
}

function createCoach(req, res, next) {
        const postParams = ['email', 'first_name', 'last_name', 'password'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmPostParams = postParams[i];
                if(!(confirmPostParams in req.body)) {
                        return sendMissingFieldError(res, confirmPostParams);
                }
	}
	Coach.hashPassword(req.body.password)
		.then(function(hashedPassword){
			return Coach
				.forge({
					email: req.body.email,
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					password: hashedPassword
				})
				.save();
		})
		.then(function(coach){
			return res.status(200).json(coach);
		})
		.catch(function(err){
			return next(err);
		});
}

function updateCoach(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	if (authenticatedCoachId === null || authenticatedCoachId !== Number(req.params.id)) {
		return sendForbiddenError(res, 'Unauthorized');
	}
	const updateParams = ['email', 'first_name', 'last_name'];
	for(var i = 0; i < updateParams.length; i++) {
		const confirmedParams = updateParams[i];
		if(!(confirmedParams in req.body)) {
			return sendMissingFieldError(res, confirmedParams);
		}
	}
	Coach
		.where({id: req.params.id})
		.fetch()
		.then(function(coach) {
			return coach.save({
				email: req.body.email,
				first_name: req.body.first_name,
				last_name: req.body.last_name
			});
		})
		.then(function(coach){
			return res.status(200).json(coach);
		})
		.catch(function(err) {
			return next(err);
		});
}

module.exports = {
	listCoaches,
	getCoachProfile,
	createCoach,
	updateCoach
};
