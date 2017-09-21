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
}

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

      // this is how we are generating the player stats
      const generateStat = player => {
        let playerStats = {
          "Hits": 0,
          "At Bats": 0,
          "Home Runs": 0,
          "Earned Runs": 0,
          "Innings Pitched": 0,
          "Strikeouts": 0
        };
        player.stats.forEach(stat => {
          playerStats[stat.description] = stat._pivot_how_many
       });
        return {
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position,
          stats: playerStats
        }
      }

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
      })

      // push the updated stats object for each player
      filteredPlayerIds.forEach((player, index) => {
        stats.push(generateStat(player));
      })

      return Object.assign({}, state, {
        stats: stats,
        teams: action.response.data.teams,
        players: filteredPlayerIds,
        first_name: action.response.data.first_name,
        last_name: action.response.data.last_name,
        email: action.response.data.email,
        id: action.response.data.id,
        city: action.response.data.teams.city
      });
      break;
    default:
      return state;
  }
}
