"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');
const coachHandlers = require('../handlers/coachHandlers');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(jsonParser);

router.get('/', ensureAuthenticated, coachHandlers.listCoaches);
router.get('/:id', ensureAuthenticated, coachHandlers.getCoachProfile);
router.post('/', ensureAuthenticated, requireTrustedOrigin, coachHandlers.createCoach);
router.put('/:id', ensureAuthenticated, requireTrustedOrigin, coachHandlers.updateCoach);

module.exports = router;
