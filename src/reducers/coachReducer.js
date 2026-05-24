import { LOGIN_SUCCESS } from '../actions/loginAction';
import { GET_PROFILE, PROFILE_SUCCESS } from '../actions/coachAction';

const defaultFilters = () => ({
	teamSearch: '',
	playerSearch: '',
	position: ''
});

const defaultDashboardPagination = () => ({
	teamPage: 1,
	teamLimit: 10,
	playerPage: 1,
	playerLimit: 10,
	notificationLimit: 10
});

const defaultPaginationMetadata = () => ({
	page: 1,
	limit: 10,
	totalItems: 0,
	totalPages: 0,
	hasPreviousPage: false,
	hasNextPage: false
});

const initialState = {
	stats: [],
	teams: [],
	players: [],
	availableSeasons: [],
	activeSeason: null,
	filters: defaultFilters(),
	dashboardPagination: defaultDashboardPagination(),
	teamPagination: defaultPaginationMetadata(),
	playerPagination: defaultPaginationMetadata(),
	notificationPagination: defaultPaginationMetadata(),
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

const normalizeFilterValue = value => {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
};

const normalizeCoachFilters = filters => ({
	teamSearch: normalizeFilterValue(filters && filters.teamSearch),
	playerSearch: normalizeFilterValue(filters && filters.playerSearch),
	position: normalizeFilterValue(filters && filters.position)
});

const normalizePositiveInteger = (value, defaultValue) => {
	const parsedValue = Number(value);

	return Number.isInteger(parsedValue) && parsedValue > 0
		? parsedValue
		: defaultValue;
};

const normalizeDashboardPagination = filters => {
	const defaults = defaultDashboardPagination();

	return {
		teamPage: normalizePositiveInteger(filters && filters.teamPage, defaults.teamPage),
		teamLimit: normalizePositiveInteger(filters && filters.teamLimit, defaults.teamLimit),
		playerPage: normalizePositiveInteger(filters && filters.playerPage, defaults.playerPage),
		playerLimit: normalizePositiveInteger(filters && filters.playerLimit, defaults.playerLimit),
		notificationLimit: normalizePositiveInteger(
			filters && filters.notificationLimit,
			defaults.notificationLimit
		)
	};
};

const normalizePaginationMetadata = pagination => Object.assign(
	defaultPaginationMetadata(),
	pagination || {}
);

export const coachReducer = (state = initialState, action) => {
	switch (action.type) {
	case LOGIN_SUCCESS:
		return Object.assign({}, state, {
			id: action.response.data.id
		});
	case GET_PROFILE:
		return Object.assign({}, state, {
			filters: normalizeCoachFilters(action.filters),
			dashboardPagination: normalizeDashboardPagination(action.filters)
		});
	case PROFILE_SUCCESS:
		let players = [];
		action.response.data.teams.forEach(team => {
			players = players.concat(team.players);
		});

		let stats = [];

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
                filteredPlayerIds.forEach(player => {
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
                        availableSeasons: action.response.data.availableSeasons || [],
                        activeSeason:
                                action.response.data.activeSeason !== undefined
                                        ? action.response.data.activeSeason
                                        : null,
                        filters: state.filters,
                        dashboardPagination: state.dashboardPagination,
                        teamPagination: normalizePaginationMetadata(action.response.data.teamPagination),
                        playerPagination: normalizePaginationMetadata(action.response.data.playerPagination),
                        notificationPagination: normalizePaginationMetadata(
                                action.response.data.notificationPagination
                        ),
                        first_name: action.response.data.first_name,
                        last_name: action.response.data.last_name,
                        email: action.response.data.email,
                        id: action.response.data.id,
                        city: city
                });
	default:
		return state;
	}
};
