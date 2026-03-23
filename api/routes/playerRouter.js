// "use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Player = require('../models/Player');
const Stat_Catalog = require('../models/Stat_Catalog');
const PlayerStat = require('../models/PlayerStat');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');
const { getAuthenticatedCoachId, coachOwnsPlayer } = require('../utils/authorization');

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

function buildScopedPlayerList(players) {
  const seenPlayerIds = new Set();

  return (players || []).filter(function(player) {
    if (!player || !Number.isInteger(Number(player.id)) || seenPlayerIds.has(Number(player.id))) {
      return false;
    }

    seenPlayerIds.add(Number(player.id));
    return true;
  });
}

function sanitizePlayerResponse(player) {
  if (!player) {
    return player;
  }

  return {
    id: player.id,
    email: player.email,
    first_name: player.first_name,
    last_name: player.last_name,
    position: player.position
  };
}

function sanitizePlayerStatsResponse(player) {
  if (!player) {
    return player;
  }

  return {
    id: player.id,
    email: player.email,
    first_name: player.first_name,
    last_name: player.last_name,
    position: player.position,
    stats: player.stats || []
  };
}

router.get('/', ensureAuthenticated, function(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);

  Player
  .fetchAll({ withRelated: ['teams', 'teams.coach'] })
  .then(function(players) {
    const playerPayload = typeof players.toJSON === 'function' ? players.toJSON() : players;
    const scopedPlayers = buildScopedPlayerList(playerPayload.filter(function(player) {
      return coachOwnsPlayer(player, authenticatedCoachId);
    })).map(sanitizePlayerResponse);

    res.json(scopedPlayers);
  })
  .catch(function(err) {
    return next(err);
  });
})

router.get('/:id', ensureAuthenticated, function(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);

  Player
  .where({id: parseInt(req.params.id, 10)})
  .fetch({withRelated: ['teams', 'teams.coach']})
  .then(function(player) {
    if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
      return res.status(403).send('Unauthorized');
    }

    res.json(sanitizePlayerResponse(player.toJSON()));
  })
  .catch(function(err) {
    return next(err);
  });
})

router.get('/:id/stats', ensureAuthenticated, function(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);

  Player
  .where({id: req.params.id})
  .fetch({withRelated: ['teams', 'teams.coach', 'stats']})
  .then(function(player) {
    if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
      return res.status(403).send('Unauthorized');
    }

    res.json(sanitizePlayerStatsResponse(player.toJSON()));
  })
  .catch(function(err) {
    return next(err);
  });
})

// update player
router.put('/:id', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
	const authenticatedCoachId = getAuthenticatedCoachId(req);
	// check to see if the proper params is equal to what the user is inputting
	const updateParams = ['email', 'first_name', 'last_name', 'position'];
	for(var i = 0; i < updateParams.length; i++) {
		const confirmedParams = updateParams[i];
		if(!(confirmedParams in req.body)) {
			const errorMessage = `Sorry your missing ${confirmedParams} please try again`
			console.error(errorMessage);
       return res.status(400).send(errorMessage);
		}
   }
	// update query db via model with new params
	Player
		.where({id: req.params.id})
		.fetch({ withRelated: ['teams', 'teams.coach'] })
		.then(function(player) {
			if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
				return res.status(403).send('Unauthorized');
			}
			return player.save({
				email: req.body.email,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				position: req.body.position
			});
		})
		.then(function(player){
			return res.status(200).json(player);
		})
		.catch(function(err) {
			return next(err);
		});
});

// update a stat tied to a player
 router.put('/:player_id/stats/:stat_catalog_id', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
   const authenticatedCoachId = getAuthenticatedCoachId(req);
   const postParams = ['how_many'];
   for (var i = 0; i < postParams.length; i++) {
     const confirmPutParams = postParams[i];
     if(!(confirmPutParams in req.body)) {
       const errorMessage = `Sorry your missing ${confirmPutParams} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }
   Player
   .where({ id: req.params.player_id })
   .fetch({ withRelated: ['teams', 'teams.coach'] })
   .then(function(player) {
     if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
       return res.status(403).send('Unauthorized');
     }

     return PlayerStat
       .where({
         player_id: req.params.player_id,
         stat_catalog_id: req.params.stat_catalog_id
       })
       .fetch()
       .then(function(stat) {
         return stat.save({
           how_many: req.body.how_many
         });
       });
   })
   .then(function(player) {
     if (!player || player.headersSent) {
       return null;
     }
     return res.status(200).json(player);
   })
   .catch(function(err) {
     return next(err);
   })
 })

// post new player
router.post('/', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
	const postParams = ['email', 'first_name', 'last_name', 'position'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmPostParams = postParams[i];
		if(!(confirmPostParams in req.body)) {
			const errorMessage = `Sorry your missing ${confirmPostParams} please try again`;
			console.error(errorMessage);
			return res.status(400).send(errorMessage);
		}
	}

	Player
		.forge({
			email: req.body.email,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			position: req.body.position,
		})
		.save()
		.then(function(player) {
			return res.status(200).json(player);
		})
		.catch(function(err) {
			return next(err);
		});
});

// post a new stat for a player
router.post('/:player_id/stats/:stat_catalog_id', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
   const authenticatedCoachId = getAuthenticatedCoachId(req);
   const postParams = ['how_many'];
   for (var i = 0; i < postParams.length; i++) {
     const confirmPostParams = postParams[i];
     if(!(confirmPostParams in req.body)) {
       const errorMessage = `Sorry your missing ${confirmPostParams} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }
  Player
  .where({ id: req.params.player_id })
  .fetch({ withRelated: ['teams', 'teams.coach'] })
  .then(function(player) {
    if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
      return res.status(403).send('Unauthorized');
    }

    return PlayerStat
      .forge({
        player_id: parseInt(req.params.player_id, 10),
        stat_catalog_id: parseInt(req.params.stat_catalog_id, 10),
        how_many: req.body.how_many
      })
      .save();
  })
  .then(function(stat) {
    if (!stat || stat.headersSent) {
      return null;
    }
    return res.status(200).json(stat);
   })
   .catch(function(err) {
     return next(err);
   })
 })


 router.delete('/:id', ensureAuthenticated, requireTrustedOrigin, function(req, res, next) {
   const authenticatedCoachId = getAuthenticatedCoachId(req);
   const deleteParams = ['id']
  for(var i = 0; i < deleteParams.length; i++) {
    const wrongId = deleteParams[i];
    if(!(wrongId in req.params)){
      const errorMessage = `Sorry your missing ${wrongId} please try again`
      console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }

  Player
  .where({
    id: parseInt(req.params.id, 10)
  })
  .fetch({ withRelated: ['teams', 'teams.coach'] })
  .then(function(player){
    if (player && !coachOwnsPlayer(player, authenticatedCoachId)) {
      return res.status(403).send('Unauthorized');
    }
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return player.destroy()
      .then(function () {
        return res.status(200).end();
      });
  })
  .catch(function(err) {
    return next(err);
  });
 })

module.exports = router;
