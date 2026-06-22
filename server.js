const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { SECRET, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const { getApiErrorResponse } = require('./api/utils/apiErrors');
const path = require('path');

const app = express();

if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
}

let store;
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
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
app.use(express.static('build'));
app.use(express.static('public'));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.use('/api/v1/players', playerRouter);
app.use('/api/v1/coaches', coachRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/stats', statRouter);
app.use('/api/v1/sessions', sessionRouter);

app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
});

// Fallback to index.html so React Router can handle routing in the client
app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
        console.error(err);
        const response = getApiErrorResponse(err);
        res.status(response.status).json(response.body);
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
