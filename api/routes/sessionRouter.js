"use strict";
const app = require('express');
const router = app.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Coach = require('../models/Coach');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.use(bodyParser.urlencoded({
        extended: true
}));
router.use(jsonParser);

/*
 * Login and create a new session
 */
router.post('/login', function(req, res){
        let coachData;
        Coach
                .where({
                        email: req.body.email
                })
                .fetch()
                .then(function(coach) {
                        coachData = coach;
                        if(!coachData){
                                res.status(404).json('Coach not found');
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
                                res.status(404).json('Wrong password');
                        }
                })
                .catch(function(err){
                        res.status(500).json(err);
                });
});

/*
 * Logout and destroy the current session
 */
router.delete('/', ensureAuthenticated, function(req, res) {
        req.session.destroy();
        res.sendStatus(204);
});

module.exports = router;
