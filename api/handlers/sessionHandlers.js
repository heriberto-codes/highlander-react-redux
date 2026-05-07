"use strict";

const Coach = require('../models/Coach');
const {
        createApiError,
        sendApiError,
        sendAuthenticationError,
        sendValidationError
} = require('../utils/apiErrors');

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

function readSession(req, res, next) {
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
                                        return sendAuthenticationError(res, 'Authentication required');
                                });
                                return;
                        }

                        res.status(200).json(buildSessionBootstrapPayload(coach));
                })
                .catch(function(err) {
                        return next(err);
                });
}

function login(req, res, next) {
        if (!req.body.email || !req.body.pwd) {
                return sendValidationError(res, 'Email and password are required');
        }
        const attemptKey = buildLoginAttemptKey(req);
        const now = Date.now();
        const existingAttempts = pruneAndReadAttempts(attemptKey, now);

        if (existingAttempts && existingAttempts.count >= MAX_LOGIN_ATTEMPTS) {
                return sendApiError(res, createApiError(429, 'Too many login attempts, please try again later'));
        }

        let coachData;
        Coach
                .where({
                        email: req.body.email
                })
                .fetch()
                .then(function(coach) {
                        coachData = coach;
                        if (!coachData) {
                                recordFailedAttempt(attemptKey, now);
                                return sendAuthenticationError(res, 'Invalid credentials');
                        }
                        return Coach.validatePassword(coachData.get('password'), req.body.pwd);
                }).then(function(validPassword) {
                        if (!coachData) {
                                return;
                        }
                        if (validPassword) {
                                clearFailedAttempts(attemptKey);
                                req.session.coachId = coachData.id;
                                res.status(200).json(coachData);
                        } else {
                                recordFailedAttempt(attemptKey, now);
                                return sendAuthenticationError(res, 'Invalid credentials');
                        }
                })
                .catch(function(err) {
                        return next(err);
                });
}

function logout(req, res) {
        req.session.destroy();
        res.sendStatus(204);
}

module.exports = {
        readSession,
        login,
        logout
};
