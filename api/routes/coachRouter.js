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

router.get('/', function(req, res, next) {
	if(req.session.coachId){ // If the session doesn't have an userId(accessToken, etc...) then you don't show the protected token
               Coach
                        .fetchAll()
                        .then(function(coaches) {
                                res.json(coaches);
                        })
                        .catch(function(err) {
                                return next(err);
                        });
	} else {
		res.status(403).send('No session available');
	}
});

router.get('/:id', function(req, res, next) {
        Coach
                .where({id: req.params.id})
                .fetch({withRelated: ['teams', 'teams.players', 'teams.players.stats']})
                .then(function(coaches) {
                        res.json(coaches);
                })
                .catch(function(err) {
                        return next(err);
                });
});

router.post('/', ensureAuthenticated, function(req, res) {
        const postParams = ['email', 'first_name', 'last_name', 'password'];
	for (var i = 0; i < postParams.length; i++) {
		const confirmPostParams = postParams[i];
                if(!(confirmPostParams in req.body)) {
                        const errorMessage = `Sorry your missing ${confirmPostParams} please try again`;
                        console.error(errorMessage);
                        return res.status(400).send(errorMessage)
                }
	}
	Coach.hashPassword(req.body.password)
		.then(function(hashedPassword){
			return Coach
				.forge({
					email: req.body.email,
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					password: hashedPassword
				})
				.save()
		})
		.then(function(coach){
			return res.status(200).json(coach);
		})
		.catch(function(err){
			return next(err);
		})
})

router.put('/:id', ensureAuthenticated, function(req, res) {
	// check to see if the proper params is equal to what the user is inputting
	const updateParams = ['email', 'first_name', 'last_name']
	for(var i = 0; i < updateParams.length; i++) {
		const confirmedParams = updateParams[i];
		if(!(confirmedParams in req.body)) {
			const errorMessage = `Sorry your missing ${confirmedParams} please try again`
			console.error(errorMessage);
			return res.status(400).send(errorMessage)
		}
	}
	// update query db via model with new params
	// req.session.coachId make comparison with req.params.id and say if they match
	// allow user to update the coach credentials
	Coach
		.where({id: req.params.id})
		.fetch()
		.then(function(coach) {
			return coach.save({
				email: req.body.email,
				first_name: req.body.first_name,
				last_name: req.body.last_name
			})
		})
		.then(function(coach){
			return res.status(200).json(coach)
		})
		.catch(function(err) {
			return next(err)
		})
})

module.exports = router;
