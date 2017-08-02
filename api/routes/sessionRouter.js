"use strict";
const app = require('express');
const router = app.Router();

router.post('/', function(req, res) {
  req.session.views = 1;
  res.status(200).json(req.session);
})

router.get('/', function(req, res) {
  if(!req.session.views) return res.status(403).json('No session available');
  req.session.views++;
  res.status(200).json(req.session);
})

router.delete('/', function(req, res){
    req.session.destroy();
    res.status(204).end();
})

module.exports = router;
