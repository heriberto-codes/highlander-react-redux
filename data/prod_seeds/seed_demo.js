const bcrypt = require('bcrypt');

const demoEmail = 'test@gmail.com';
const demoPassword = '1234';
const saltRounds = 10;

const statDescriptions = [
  'Hits',
  'At Bats',
  'Home Runs',
  'Earned Runs',
  'Innings Pitched',
  'Strikeouts'
];

const teamSeeds = [
  {
    name: 'Highlander Legends',
    city: 'Bronx',
    state: 'NY',
    season: 2024,
    opponent: 'Brooklyn Bears',
    gameDate: '2024-06-15T00:00:00Z',
    players: [
      { email: 'maya.chen.2024@example.com', first_name: 'Maya', last_name: 'Chen', position: 'Pitcher' },
      { email: 'jordan.reed.2024@example.com', first_name: 'Jordan', last_name: 'Reed', position: 'Catcher' },
      { email: 'sofia.martinez.2024@example.com', first_name: 'Sofia', last_name: 'Martinez', position: 'Shortstop' }
    ]
  },
  {
    name: 'Highlander Storm',
    city: 'Queens',
    state: 'NY',
    season: 2025,
    opponent: 'Harlem Hawks',
    gameDate: '2025-06-14T00:00:00Z',
    players: [
      { email: 'liam.brooks.2025@example.com', first_name: 'Liam', last_name: 'Brooks', position: 'First Base' },
      { email: 'ava.patel.2025@example.com', first_name: 'Ava', last_name: 'Patel', position: 'Second Base' },
      { email: 'noah.williams.2025@example.com', first_name: 'Noah', last_name: 'Williams', position: 'Center Field' }
    ]
  },
  {
    name: 'Highlander United',
    city: 'Brooklyn',
    state: 'NY',
    season: 2026,
    opponent: 'Queens Cyclones',
    gameDate: '2026-06-13T00:00:00Z',
    players: [
      { email: 'emma.johnson.2026@example.com', first_name: 'Emma', last_name: 'Johnson', position: 'Third Base' },
      { email: 'ethan.kim.2026@example.com', first_name: 'Ethan', last_name: 'Kim', position: 'Left Field' },
      { email: 'isabella.davis.2026@example.com', first_name: 'Isabella', last_name: 'Davis', position: 'Right Field' }
    ]
  }
];

function buildStatTotals(teamIndex, playerIndex) {
  return [
    5 + teamIndex + playerIndex,
    12 + teamIndex + playerIndex,
    1 + ((teamIndex + playerIndex) % 3),
    playerIndex === 0 ? 2 + teamIndex : 0,
    playerIndex === 0 ? 6 + teamIndex : 0,
    playerIndex === 0 ? 7 + teamIndex : 1 + playerIndex
  ];
}

function getInsertedId(returnedRows) {
  const firstRow = returnedRows[0];
  return typeof firstRow === 'object' ? firstRow.id : firstRow;
}

exports.seed = function(knex) {
  return knex.transaction(async function(trx) {
    const playerEmails = teamSeeds.reduce(function(emails, team) {
      return emails.concat(team.players.map(function(player) {
        return player.email;
      }));
    }, []);

    const existingCoach = await trx('coaches').where({ email: demoEmail }).first();
    const existingPlayers = await trx('players').whereIn('email', playerEmails).select('id');
    const existingPlayerIds = existingPlayers.map(function(player) {
      return player.id;
    });

    if (existingCoach) {
      const existingTeams = await trx('coaches_teams')
        .where({ coach_id: existingCoach.id })
        .select('team_id');
      const existingTeamIds = existingTeams.map(function(team) {
        return team.team_id;
      });

      await trx('coach_notifications').where({ coach_id: existingCoach.id }).del();

      if (existingTeamIds.length > 0) {
        const existingGames = await trx('games').whereIn('team_id', existingTeamIds).select('id');
        const existingGameIds = existingGames.map(function(game) {
          return game.id;
        });

        if (existingGameIds.length > 0) {
          await trx('players_stat_catalogs').whereIn('game_id', existingGameIds).del();
        }

        await trx('games').whereIn('team_id', existingTeamIds).del();
        await trx('players_teams').whereIn('team_id', existingTeamIds).del();
        await trx('coaches_teams').whereIn('team_id', existingTeamIds).del();
        await trx('teams').whereIn('id', existingTeamIds).del();
      }

      await trx('coaches').where({ id: existingCoach.id }).del();
    }

    if (existingPlayerIds.length > 0) {
      await trx('players_stat_catalogs').whereIn('player_id', existingPlayerIds).del();
      await trx('players_teams').whereIn('player_id', existingPlayerIds).del();
      await trx('players').whereIn('id', existingPlayerIds).del();
    }

    const existingCatalogs = await trx('stat_catalogs')
      .whereIn('description', statDescriptions)
      .select('id', 'description');
    const catalogIdsByDescription = existingCatalogs.reduce(function(catalogs, catalog) {
      catalogs[catalog.description] = catalog.id;
      return catalogs;
    }, {});

    for (const description of statDescriptions) {
      if (!catalogIdsByDescription[description]) {
        const insertedCatalogs = await trx('stat_catalogs')
          .insert({ description: description })
          .returning(['id', 'description']);
        catalogIdsByDescription[description] = insertedCatalogs[0].id;
      }
    }

    const hashedPassword = await bcrypt.hash(demoPassword, saltRounds);
    const insertedCoaches = await trx('coaches')
      .insert({
        email: demoEmail,
        password: hashedPassword,
        first_name: 'Demo',
        last_name: 'Coach'
      })
      .returning('id');
    const coachId = getInsertedId(insertedCoaches);

    for (let teamIndex = 0; teamIndex < teamSeeds.length; teamIndex += 1) {
      const teamSeed = teamSeeds[teamIndex];
      const insertedTeams = await trx('teams')
        .insert({
          name: teamSeed.name,
          city: teamSeed.city,
          state: teamSeed.state,
          season: teamSeed.season,
          game_date: new Date(teamSeed.gameDate)
        })
        .returning('id');
      const teamId = getInsertedId(insertedTeams);

      await trx('coaches_teams').insert({
        coach_id: coachId,
        team_id: teamId,
        role: 'owner'
      });

      const insertedGames = await trx('games')
        .insert({
          team_id: teamId,
          opponent: teamSeed.opponent,
          game_date: new Date(teamSeed.gameDate)
        })
        .returning('id');
      const gameId = getInsertedId(insertedGames);

      for (let playerIndex = 0; playerIndex < teamSeed.players.length; playerIndex += 1) {
        const playerSeed = teamSeed.players[playerIndex];
        const insertedPlayers = await trx('players')
          .insert(playerSeed)
          .returning('id');
        const playerId = getInsertedId(insertedPlayers);

        await trx('players_teams').insert({
          team_id: teamId,
          player_id: playerId
        });

        const statTotals = buildStatTotals(teamIndex, playerIndex);
        const statRows = statDescriptions.map(function(description, statIndex) {
          return {
            player_id: playerId,
            stat_catalog_id: catalogIdsByDescription[description],
            how_many: statTotals[statIndex],
            game_id: gameId,
            game_date: new Date(teamSeed.gameDate)
          };
        });

        await trx('players_stat_catalogs').insert(statRows);
      }
    }
  });
};
