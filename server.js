"use strict";
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const config = require('./config');
const bodyParser = require('body-parser');

const app = express();

const sess = {
  // store: config.SESSION_STORAGE_URL,
  secret: config.SECRET,
  name: 'SessionMgmt',
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    maxAge: 5 * 60 * 1000 //min * seconds * miliseconds
  }
};

const playerRouter = require('./api/routes/playerRouter');
const coachRouter = require('./api/routes/coachRouter');
const teamRouter = require('./api/routes/teamRouter');
const statRouter = require('./api/routes/statRouter');

app.use(morgan('common'));
app.use(session(sess));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/players', playerRouter);
app.use('/coaches', coachRouter);
app.use('/teams', teamRouter);
app.use('/stats', statRouter);
app.use('/sessions', coachRouter);

let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    })
    .on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if(err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
