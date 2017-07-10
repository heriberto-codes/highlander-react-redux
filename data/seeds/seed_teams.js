exports.seed = function (knex, Promise) {
  return knex('teams').del()
    .then(function () {
      return knex('teams').insert([
        {name: 'Highlanders', city: 'Bronx', state: 'NY', game_date: new Date()},
        {name: 'Gem Stars', city: 'Queens', state: 'NY', game_date: new Date()},
        {name: 'Warriors', city: 'Brooklyn', state: 'NY', game_date: new Date()},
        {name: 'Tigers', city: 'Bronx', state: 'NY', game_date: new Date()}
      ]);
    });
};
