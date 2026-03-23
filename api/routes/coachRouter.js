"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Coach = require('../models/Coach');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');
const { addDerivedStatsToCoachPayload, addDerivedStatsToPlayers } = require('../utils/playerAnalytics');
const { getAuthenticatedCoachId } = require('../utils/authorization');
const {
	parseRequestedSeason,
	parseOptionalFilterText,
	matchesCaseInsensitiveFilter,
	matchesOptionalPositionFilter,
	buildPlayerSearchText
} = require('../utils/filterQuery');

router.use(bodyParser.urlencoded({
	extended: true
}));
router.use(jsonParser);

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

	return {
		value: {
			season: requestedSeason.value,
			teamSearch: teamSearch.value,
			playerSearch: playerSearch.value,
			position: position.value,
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

router.get('/', ensureAuthenticated, function(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);

	Coach
		.where({ id: authenticatedCoachId })
		.fetch()
		.then(function(coach) {
			if (!coach) {
				return res.status(404).send('Coach not found');
			}

			res.json([coach.toJSON()]);
		})
		.catch(function(err) {
			return next(err);
		});
});

router.get('/:id', ensureAuthenticated, function(req, res, next) {
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
         */
        const parsedFilters = parseDashboardFilters(req.query);
        if (parsedFilters.error) {
                return res.status(400).send(parsedFilters.error);
        }
        const authenticatedCoachId = getAuthenticatedCoachId(req);
        if (authenticatedCoachId === null || authenticatedCoachId !== Number(req.params.id)) {
                return res.status(403).send('Unauthorized');
        }

        Coach
                .where({id: req.params.id})
                .fetch({withRelated: ['teams', 'teams.players', 'teams.players.stats']})
                .then(function(coaches) {
                        const coachPayload = addDerivedStatsToCoachPayload(coaches);
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

                        coachPayload.teams = teams
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
                        coachPayload.availableSeasons = availableSeasons;
                        coachPayload.activeSeason = activeSeason;

                        res.json(coachPayload);
                })
                .catch(function(err) {
                        return next(err);
                });
});

router.post('/', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
        const postParams = ['email', 'first_name', 'last_name', 'password'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmPostParams = postParams[i];
                if(!(confirmPostParams in req.body)) {
                        const errorMessage = `Sorry your missing ${confirmPostParams} please try again`;
                        console.error(errorMessage);
                        return res.status(400).send(errorMessage)
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
				.save()
		})
		.then(function(coach){
			return res.status(200).json(coach);
		})
		.catch(function(err){
			return next(err);
		})
})

router.put('/:id', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	if (authenticatedCoachId === null || authenticatedCoachId !== Number(req.params.id)) {
		return res.status(403).send('Unauthorized');
	}
	// check to see if the proper params is equal to what the user is inputting
	const updateParams = ['email', 'first_name', 'last_name']
	for(var i = 0; i < updateParams.length; i++) {
		const confirmedParams = updateParams[i];
		if(!(confirmedParams in req.body)) {
			const errorMessage = `Sorry your missing ${confirmedParams} please try again`
			console.error(errorMessage);
			return res.status(400).send(errorMessage)
		}
	}
	// update query db via model with new params
	// req.session.coachId make comparison with req.params.id and say if they match
	// allow user to update the coach credentials
	Coach
		.where({id: req.params.id})
		.fetch()
		.then(function(coach) {
			return coach.save({
				email: req.body.email,
				first_name: req.body.first_name,
				last_name: req.body.last_name
			})
		})
		.then(function(coach){
			return res.status(200).json(coach)
		})
		.catch(function(err) {
			return next(err)
		})
})

module.exports = router;
