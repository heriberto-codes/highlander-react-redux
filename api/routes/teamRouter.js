"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Team = require('../models/Team');
const Player = require('../models/Player');
const Coaches = require('../models/Coach');

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

router.get('/', function(req, res) {
  Team
  .fetchAll()
  .then(function(teams) {
    res.json(teams);
  })
})


router.get('/:id', function(req, res) {
  Team
  .where({id: req.params.id})
  .fetch({withRelated: ['coach', 'players']})
  .then(function(teams) {
    console.log(teams);
    res.json(teams);
  })
})

router.put('/:id', function(req, res) {
  // check to see if the proper params is equal to what the user is inputting
  const updateParams = ['name', 'city', 'state']
  for(var i = 0; i < updateParams.length; i++) {
    const confirmedParams = updateParams[i]
    if(!(confirmedParams in req.body)) {
      const errorMessage = `Sorry your missing ${confirmedParams} please try again`
      console.error(errorMessage);
      return res.status(400).send(errorMessage);
    }
  }

  // update query db via model with new params
  Team
  .where({id: req.params.id})
  .fetch()
  .then(function(team) {
    return team.save({
      name: req.body.name,
      city: req.body.city,
      state: req.body.state
    })
  })
  .then(function(team) {
    return res.status(200).json(team);
  })
  .catch(function(err) {
    return res.status(500).json(err);
  })
})

router.post('/', function(req, res) {
  const postParams = ['name', 'city', 'state'];
  for (var i = 0; i < postParams.length; i++) {
    const confirmPostParams = postParams[i];
    if(!(confirmPostParams in req.body)) {
      const errorMessage = `Sorry your missing ${confirmPostParams} please try again`
      console.error(errorMessage);
      return res.status(400).send(errorMessage);
    }
  }

  Team
  .forge({
    name: req.body.name,
    city: req.body.city,
    state: req.body.state,
    game_date: new Date()
  })
  .save()
  .then(function(team) {
  team.coach().attach(req.body.coachId)
    return res.status(200).json(team);
  })
  .catch(function(err) {
    return res.status(500).json(err);
  })
})

router.post('/:id/player', function(req, res) {
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
    return res.status(500).json(err)
  })
})


module.exports = router;
