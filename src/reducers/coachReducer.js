import { LOGIN_SUCCESS } from '../actions/loginAction';
import { GET_PROFILE, PROFILE_SUCCESS, PROFILE_ERROR } from '../actions/coachAction';

const initialState = {
	stats: [],
	teams: [],
	players: [],
	first_name: '',
	last_name: '',
	email: '',
	id: null,
	city: '',
	state: ''
};

const defaultRawStats = () => ({
	'Hits': 0,
	'At Bats': 0,
	'Home Runs': 0,
	'Earned Runs': 0,
	'Innings Pitched': 0,
	'Strikeouts': 0
});

const normalizeDerivedStats = derivedStats => ({
	battingAverage:
		derivedStats && derivedStats.battingAverage !== undefined
			? derivedStats.battingAverage
			: null,
	homeRunRate:
		derivedStats && derivedStats.homeRunRate !== undefined
			? derivedStats.homeRunRate
			: null,
	era:
		derivedStats && derivedStats.era !== undefined
			? derivedStats.era
			: null,
	strikeoutsPerInning:
		derivedStats && derivedStats.strikeoutsPerInning !== undefined
			? derivedStats.strikeoutsPerInning
			: null
});

const extractRawStats = player => {
	const playerStats = defaultRawStats();
	(player.stats || []).forEach(stat => {
		if (stat.description in playerStats) {
			playerStats[stat.description] += stat._pivot_how_many;
		}
	});
	return playerStats;
};

const buildDashboardPlayerStat = player => ({
	first_name: player.first_name,
	last_name: player.last_name,
	position: player.position,
	stats: extractRawStats(player),
	derivedStats: normalizeDerivedStats(player.derivedStats)
});

export const coachReducer = (state = initialState, action) => {
	switch (action.type) {
	case LOGIN_SUCCESS:
		return Object.assign({}, state, {
			id: action.response.data.id
		});
		break;
	case PROFILE_SUCCESS:
		let players = [];
		action.response.data.teams.forEach(team => {
			players = players.concat(team.players);
		});

		let stats = [];
		let playerIds = [];

		// sort by id
		players.sort((player1, player2) => {
			return player1.id - player2.id;
		});

		// filter the players
		let filteredPlayerIds = players.filter((player, index) => {
			if (index === 0) {
				return player;
			}
			if (players[index - 1].id !== player.id) {
				return player;
			}
		});

                // push the updated stats object for each player
                filteredPlayerIds.forEach((player, index) => {
                        stats.push(buildDashboardPlayerStat(player));
                });

                const city =
                        action.response.data.teams &&
                        action.response.data.teams.length > 0 &&
                        action.response.data.teams[0].city
                                ? action.response.data.teams[0].city
                                : '';

                return Object.assign({}, state, {
                        stats: stats,
                        teams: action.response.data.teams,
                        players: filteredPlayerIds,
                        first_name: action.response.data.first_name,
                        last_name: action.response.data.last_name,
                        email: action.response.data.email,
                        id: action.response.data.id,
                        city: city
                });
		break;
	default:
		return state;
	}
};
