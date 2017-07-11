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
  .then(function(stats) {
    res.json(stats);
  })
})

router.get('/:id', function(req, res) {
  Stat
  .where({id: req.params.id})
  .fetch({withRelated: ['stats', 'stats.player']})
  .then(function(stats) {
    res.json(stats);
  })
})

module.exports = router;
