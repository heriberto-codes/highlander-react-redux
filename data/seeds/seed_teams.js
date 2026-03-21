exports.seed = function (knex, Promise) {
  const season = 2026;

  return knex('teams').del()
    .then(function () {
      return knex('teams').insert([
        {name: 'Highlanders', city: 'Bronx', state: 'NY', season, game_date: new Date('2026-03-01T00:00:00Z')},
        {name: 'Gem Stars', city: 'Queens', state: 'NY', season, game_date: new Date('2026-03-08T00:00:00Z')},
        {name: 'Warriors', city: 'Brooklyn', state: 'NY', season, game_date: new Date('2026-03-15T00:00:00Z')},
        {name: 'Tigers', city: 'Bronx', state: 'NY', season, game_date: new Date('2026-03-22T00:00:00Z')}
      ]);
    });
};
