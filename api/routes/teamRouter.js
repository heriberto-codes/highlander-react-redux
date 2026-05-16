'use strict';
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');
const teamHandlers = require('../handlers/teamHandlers');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(jsonParser);

router.get('/', teamHandlers.listTeams);
router.get('/:id/coaches', ensureAuthenticated, teamHandlers.listTeamCoaches);
router.post('/:id/coaches', ensureAuthenticated, requireTrustedOrigin, teamHandlers.addTeamCoach);
router.put('/:id/coaches/:coachId', ensureAuthenticated, requireTrustedOrigin, teamHandlers.updateTeamCoach);
router.delete('/:id/coaches/:coachId', ensureAuthenticated, requireTrustedOrigin, teamHandlers.deleteTeamCoach);
router.get('/:id', ensureAuthenticated, teamHandlers.getTeam);
router.put('/:id', ensureAuthenticated, requireTrustedOrigin, teamHandlers.updateTeam);
router.post('/', ensureAuthenticated, requireTrustedOrigin, teamHandlers.createTeam);
router.post('/:id/games', ensureAuthenticated, requireTrustedOrigin, teamHandlers.createTeamGame);
router.post('/:id/player', ensureAuthenticated, requireTrustedOrigin, teamHandlers.createTeamPlayer);

module.exports = router;
