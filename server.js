const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { SECRET, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const path = require('path');

const app = express();

let store;
if (process.env.NODE_ENV === 'test') {
        store = new session.MemoryStore();
} else {
        const PGSession = require('connect-pg-simple')(session);
        store = new PGSession({
                conString: DATABASE_URL
        });
}

const sess = {
        store,
        secret: SECRET,
        name: 'SessionMgmt',
        resave: false,
        saveUninitialized: false,
        cookie: {
                path: '/',
                maxAge: 5 * 60 * 1000, //min * seconds * milliseconds
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
        }
};

const playerRouter = require('./api/routes/playerRouter');
const coachRouter = require('./api/routes/coachRouter');
const teamRouter = require('./api/routes/teamRouter');
const statRouter = require('./api/routes/statRouter');
const sessionRouter = require('./api/routes/sessionRouter');


app.use(helmet());
app.use(morgan('common'));
app.use(session(sess));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static('build'));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.use('/players', playerRouter);
app.use('/coaches', coachRouter);
app.use('/teams', teamRouter);
app.use('/stats', statRouter);
app.use('/sessions', sessionRouter);

// Fallback to index.html so React Router can handle routing in the client
app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
});

let server;

function runServer() {
	const port = process.env.PORT || 8080;
	return new Promise((resolve, reject) => {
		server = app.listen(port, () => {
			console.log(`Your app is listening on port ${port}`);
			resolve(server);
		})
			.on('error', err => {
				reject(err);
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
}

module.exports = {app, runServer, closeServer};
