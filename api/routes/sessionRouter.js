"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Coach = require('../models/Coach');

router.use(bodyParser.urlencoded({
        extended: true
}));
router.use(jsonParser);

/*
 * Login and create a new session
 */
router.post('/login', function(req, res){
        if (!req.body.email || !req.body.pwd) {
                res.status(400).json('Email and password are required');
                return;
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
                                res.status(401).json('Invalid credentials');
                                return;
                        }
                        return Coach.validatePassword(coachData.get('password'), req.body.pwd);
                }).then(function(validPassword){
                        if(!coachData){
                                return;
                        }
                        if(validPassword){
                                req.session.coachId = coachData.id;
                                res.status(200).json(coachData);
                        } else {
                                res.status(401).json('Invalid credentials');
                        }
                })
                .catch(function(err){
                        res.status(500).json(err);
                });
        // TODO: Implement rate limiting or account lockout to deter brute-force attacks.
});

/*
 * Logout and destroy the current session
 */
router.delete('/', function(req, res) {
        req.session.destroy();
        res.sendStatus(204);
});

module.exports = router;
