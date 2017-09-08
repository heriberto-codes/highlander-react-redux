import { LOGIN_SUCCESS } from '../actions/loginAction';
import { GET_PROFILE, PROFILE_SUCCESS, PROFILE_ERROR } from '../actions/coachAction';

const initialState = {
  stats: [],
  teams: [],
  players: [],
  first_name: '',
  last_name: '',
  email: '',
  id: null
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
       console.log(playerStats);
        return {
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position,
          stats: playerStats,
        }
      }
      let stats = [];
      let playerIDs = {};
      players.forEach((player, index) => {
        if(!playerIDs[player.id]){
          stats.push(generateStat(player));
          playerIDs[player.id] = true;
        }
      })
      return Object.assign({}, state, {
        stats: stats,
        teams: action.response.data.teams,
        players: players,
        first_name: action.response.data.first_name,
        last_name: action.response.data.last_name,
        email: action.response.data.email,
        id: action.response.data.id
      });
      break;
    default:
      return state;
  }
}
