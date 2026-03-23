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

router.use(bodyParser.urlencoded({
        extended: true
}));
router.use(jsonParser);

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
