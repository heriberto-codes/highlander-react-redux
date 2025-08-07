// "use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Player = require('../models/Player');
const Stat_Catalog = require('../models/Stat_Catalog');
const PlayerStat = require('../models/PlayerStat');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

router.get('/', function(req, res, next) {
  Player
  .fetchAll()
  .then(function(players) {
    res.json(players);
  })
  .catch(function(err) {
    return next(err);
  });
})

router.get('/:id', function(req, res, next) {
  Player
  .where({id: parseInt(req.params.id, 10)})
  .fetch({withRelated: ['teams']})
  .then(function(players) {
    res.json(players);
  })
  .catch(function(err) {
    return next(err);
  });
})

router.get('/:id/stats', function(req, res, next) {
  Player
  .where({id: req.params.id})
  .fetch({withRelated: ['stats']})
  .then(function(stats) {
    res.json(stats);
  })
  .catch(function(err) {
    return next(err);
  });
})

// update player
router.put('/:id', ensureAuthenticated, function(req, res) {
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
		.fetch()
		.then(function(player) {
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
 router.put('/:player_id/stats/:stat_catalog_id', ensureAuthenticated, function(req, res) {
   const postParams = ['how_many'];
   for (var i = 0; i < postParams.length; i++) {
     const confirmPutParams = postParams[i];
     if(!(confirmPutParams in req.body)) {
       const errorMessage = `Sorry your missing ${confirmPutParams} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }

   PlayerStat
   .where({
     player_id: req.params.player_id,
     stat_catalog_id: req.params.stat_catalog_id
   })
   .fetch()
   .then(function(stat) {
     return stat.save({
       how_many: req.body.how_many
     })
   })
   .then(function(player) {
     return res.status(200).json(player);
   })
   .catch(function(err) {
     return next(err);
   })
 })

// post new player
router.post('/', ensureAuthenticated, function(req, res) {
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
 router.post('/:player_id/stats/:stat_catalog_id', ensureAuthenticated, function(req, res) {
   const postParams = ['how_many'];
   for (var i = 0; i < postParams.length; i++) {
     const confirmPostParams = postParams[i];
     if(!(confirmPostParams in req.body)) {
       const errorMessage = `Sorry your missing ${confirmPostParams} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }

  PlayerStat
  .forge({
    player_id: parseInt(req.params.player_id, 10),
    stat_catalog_id: parseInt(req.params.stat_catalog_id, 10),
    how_many: req.body.how_many
  })
  .save()
  .then(function(stat) {
    return res.status(200).json(stat);
   })
   .catch(function(err) {
     return next(err);
   })
 })


 router.delete('/:id', ensureAuthenticated, function(req, res) {
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
  .fetch()
  .then(function(player){
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
