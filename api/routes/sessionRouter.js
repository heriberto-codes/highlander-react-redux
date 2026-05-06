"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');
const sessionHandlers = require('../handlers/sessionHandlers');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(jsonParser);

/*
 * Planned session bootstrap contract
 * Route: GET /sessions
 * Auth source: req.session.coachId only
 * Purpose: restore client auth state after refresh without requiring a new login
 * Success shape: minimal current-coach identity payload only; no password or full dashboard data
 * Failure shape: 401 when no valid authenticated session exists
 * Side effects: none; read-only endpoint
 */

/*
 * Read the current authenticated session for client bootstrap
 */
router.get('/', ensureAuthenticated, sessionHandlers.readSession);

/*
 * Login and create a new session
 */

router.post('/login', requireTrustedOrigin, sessionHandlers.login);

/*
 * Logout and destroy the current session
 */
router.delete('/', ensureAuthenticated, requireTrustedOrigin, sessionHandlers.logout);

module.exports = router;
