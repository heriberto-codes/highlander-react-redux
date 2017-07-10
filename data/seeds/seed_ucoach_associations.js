exports.seed = function(knex, Promise) {
  return knex('coaches_teams').del()
    .then(function () {
      return knex('coaches_teams').insert([
        {coach_id: 1, team_id: 3},
        {coach_id: 1, team_id: 2},
        {coach_id: 2, team_id: 4},
        {coach_id: 2, team_id: 1}
      ])
    });
};
