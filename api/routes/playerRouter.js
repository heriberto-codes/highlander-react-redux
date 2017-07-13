// "use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Player = require('../models/Player');
const Stat = require('../models/Stat');

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

router.get('/', function(req, res) {
  Player
  .fetchAll()
  .then(function(players) {
    res.json(players);
  })
})

router.get('/:player_id', function(req, res) {
  console.log('req.params.player_id goes here =====>', req.params.player_id)
  Player
  .where({player_id: parseInt(req.params.player_id)})
  .fetch({withRelated: ['teams']})
  .then(function(players) {
    console.log('players', players)
    res.json(players);
  })
})

router.get('/:id/stats', function(req, res) {
  Player
  .where({player_id: req.params.id})
  .fetch({withRelated: ['stats','stats.catalog']})
  .then(function(stats) {
    res.json(stats);
  })
})

// update player
router.put('/:id', function(req, res) {
  // check to see if the proper params is equal to what the user is inputting
   const updateParams = ['email', 'first_name', 'last_name', 'position']
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
     })
   })
   .then(function(player){
     return res.status(200).json(player);
   })
   .catch(function(err) {
     return res.status(500).json(err);
   })
 })

// update a stat tied to a player
 router.put('/:player_id/stats/:stat_catalog_id', function(req, res) {
   const postParams = ['how_many'];
   for (var i = 0; i < postParams.length; i++) {
     const confirmPutParams = postParams[i];
     if(!(confirmPutParams in req.body)) {
       const errorMessage = `Sorry your missing ${confirmPutParams} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }

   Stat
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
     return res.status(500).json(err);
   })
 })

// post new player
 router.post('/', function(req, res) {
   const postParams = ['email', 'first_name', 'last_name', 'position'];
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
     position: req.body.position,
   })
   .save()
   .then(function(player) {
     return res.status(200).json(player);
   })
   .catch(function(err) {
     return res.status(500).json(err);
   })
 })

// post a new stat for a player
 router.post('/:player_id/stats/:stat_catalog_id', function(req, res) {
   const postParams = ['how_many'];
   for (var i = 0; i < postParams.length; i++) {
     const confirmPostParams = postParams[i];
     if(!(confirmPostParams in req.body)) {
       const errorMessage = `Sorry your missing ${confirmPostParams} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }

   Stat
   .forge({
     player_id: parseInt(req.params.player_id),
     stat_catalog_id: parseInt(req.params.stat_catalog_id),
     how_many: req.body.how_many
   })
   .save()
   .then(function(stat) {
     return res.status(200).json(stat);
   })
   .catch(function(err) {
     return res.status(500).json(err);
   })
 })


 router.delete('/:id', function(req, res) {
   const deleteParams = ['id']
   for(var i = 0; i < deleteParams.length; i++) {
     const wrongId = deleteParams[i];
     console.log(':: wrong id is here =====> ::', wrongId)
     if(!(wrongId in req.params)){
       const errorMessage = `Sorry your missing ${wrongId} please try again`
       console.error(errorMessage);
       return res.status(400).send(errorMessage);
     }
   }

   Player
   .where({
     id: parseInt(req.params.id)
   })
   .fetch()
   .then(function(player){
     return player.destroy();
   })
   .then(function (player){
     return res.status(200).end()
   })
})

module.exports = router;
