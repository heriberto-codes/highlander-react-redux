exports.seed = function (knex, Promise) {
  return knex('teams_players').del()
  .then(function () {
    return knex('teams_players').insert([
      {team_id: 1, player_id: 4},
      {team_id: 1, player_id: 2},
      {team_id: 2, player_id: 3},
      {team_id: 3, player_id: 2},
      {team_id: 4, player_id: 4},
      {team_id: 3, player_id: 3},
      {team_id: 2, player_id: 1},
      {team_id: 1, player_id: 1},
      {team_id: 4, player_id: 1}
    ])
  });
};
