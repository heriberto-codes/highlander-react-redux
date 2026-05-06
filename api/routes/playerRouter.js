"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');
const playerHandlers = require('../handlers/playerHandlers');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(jsonParser);

router.get('/', ensureAuthenticated, playerHandlers.listPlayers);
router.get('/:id', ensureAuthenticated, playerHandlers.getPlayer);
router.get('/:id/stats', ensureAuthenticated, playerHandlers.getPlayerStats);
router.put('/:id', ensureAuthenticated, requireTrustedOrigin, playerHandlers.updatePlayer);
router.put('/:player_id/stats/:stat_catalog_id', ensureAuthenticated, requireTrustedOrigin, playerHandlers.updatePlayerStat);
router.post('/', ensureAuthenticated, requireTrustedOrigin, playerHandlers.createPlayer);
router.post('/:player_id/stats/:stat_catalog_id', ensureAuthenticated, requireTrustedOrigin, playerHandlers.createPlayerStat);
router.delete('/:id', ensureAuthenticated, requireTrustedOrigin, playerHandlers.deletePlayer);

module.exports = router;
