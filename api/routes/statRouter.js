"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Stat = require('../models/Stat_Catalog')

router.use(bodyParser.urlencoded({extended: true}));
router.use(jsonParser);

router.get('/', function(req, res) {
  Stat
  .fetchAll()
  .then(function(statCatalogs) {
    res.json(statCatalogs);
  })
})

router.get('/:id', function(req, res) {
  Stat
  .where({id: req.params.id})
  .fetch({withRelated: ['players', 'players.stats']})
  .then(function(stat) {
    res.json(stat);
  })
})

module.exports = router;
