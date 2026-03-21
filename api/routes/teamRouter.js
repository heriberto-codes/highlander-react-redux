const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Team = require('../models/Team');
const Player = require('../models/Player');
const Coaches = require('../models/Coach');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const { addDerivedStatsToPlayers } = require('../utils/playerAnalytics');

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

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
