"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Coach = require('../models/Coach');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function buildLoginAttemptKey(req) {
        const email = typeof req.body.email === 'string'
                ? req.body.email.trim().toLowerCase()
                : '';
        return `${req.ip}:${email}`;
}

function pruneAndReadAttempts(attemptKey, now) {
        const entry = loginAttempts.get(attemptKey);

        if (!entry || now - entry.firstAttemptAt >= LOGIN_WINDOW_MS) {
                loginAttempts.delete(attemptKey);
                return null;
        }

        return entry;
}

function recordFailedAttempt(attemptKey, now) {
        const entry = pruneAndReadAttempts(attemptKey, now);

        if (!entry) {
                loginAttempts.set(attemptKey, {
                        count: 1,
                        firstAttemptAt: now
                });
                return;
        }

        loginAttempts.set(attemptKey, {
                count: entry.count + 1,
                firstAttemptAt: entry.firstAttemptAt
        });
}

function clearFailedAttempts(attemptKey) {
        loginAttempts.delete(attemptKey);
}

function buildSessionBootstrapPayload(coach) {
        const coachData = typeof coach.toJSON === 'function'
                ? coach.toJSON()
                : coach;

        return {
                id: coachData.id,
                email: coachData.email,
                first_name: coachData.first_name,
                last_name: coachData.last_name
        };
}

router.use(bodyParser.urlencoded({
        extended: true
}));
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
router.get('/', ensureAuthenticated, function(req, res, next) {
        Coach
                .where({
                        id: req.session.coachId
                })
                .fetch({
                        columns: ['id', 'email', 'first_name', 'last_name']
                })
                .then(function(coach) {
                        if (!coach) {
                                req.session.destroy(function() {
                                        res.sendStatus(401);
                                });
                                return;
                        }

                        res.status(200).json(buildSessionBootstrapPayload(coach));
                })
                .catch(function(err) {
                        return next(err);
                });
});

/*
 * Login and create a new session
 */

router.post('/login', requireTrustedOrigin, function(req, res, next){
        if (!req.body.email || !req.body.pwd) {
                res.status(400).json('Email and password are required');
                return;
        }
        const attemptKey = buildLoginAttemptKey(req);
        const now = Date.now();
        const existingAttempts = pruneAndReadAttempts(attemptKey, now);

        if (existingAttempts && existingAttempts.count >= MAX_LOGIN_ATTEMPTS) {
                return res.status(429).json('Too many login attempts, please try again later');
        }

        let coachData;
        Coach
                .where({
                        email: req.body.email
                })
                .fetch()
                .then(function(coach) {
                        coachData = coach;
                        if(!coachData){
                                recordFailedAttempt(attemptKey, now);
                                res.status(401).json('Invalid credentials');
                                return;
                        }
                        return Coach.validatePassword(coachData.get('password'), req.body.pwd);
                }).then(function(validPassword){
                        if(!coachData){
                                return;
                        }
                        if(validPassword){
                                clearFailedAttempts(attemptKey);
                                req.session.coachId = coachData.id;
                                res.status(200).json(coachData);
                        } else {
                                recordFailedAttempt(attemptKey, now);
                                res.status(401).json('Invalid credentials');
                        }
                })
                .catch(function(err){
                        return next(err);
                });
});

/*
 * Logout and destroy the current session
 */
router.delete('/', ensureAuthenticated, requireTrustedOrigin, function(req, res) {
        req.session.destroy();
        res.sendStatus(204);
});

module.exports = router;
