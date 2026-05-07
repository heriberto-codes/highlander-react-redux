"use strict";

const Player = require('../models/Player');
const PlayerStat = require('../models/PlayerStat');
const { getAuthenticatedCoachId, coachOwnsPlayer } = require('../utils/authorization');
const {
  sendForbiddenError,
  sendNotFoundError,
  sendValidationError
} = require('../utils/apiErrors');

function buildScopedPlayerList(players) {
  const seenPlayerIds = new Set();

  return (players || []).filter(function(player) {
    if (!player || !Number.isInteger(Number(player.id)) || seenPlayerIds.has(Number(player.id))) {
      return false;
    }

    seenPlayerIds.add(Number(player.id));
    return true;
  });
}

function sanitizePlayerResponse(player) {
  if (!player) {
    return player;
  }

  return {
    id: player.id,
    email: player.email,
    first_name: player.first_name,
    last_name: player.last_name,
    position: player.position
  };
}

function sanitizePlayerStatsResponse(player) {
  if (!player) {
    return player;
  }

  return {
    id: player.id,
    email: player.email,
    first_name: player.first_name,
    last_name: player.last_name,
    position: player.position,
    stats: player.stats || []
  };
}

function sendMissingFieldError(res, field) {
  return sendValidationError(res, `Sorry your missing ${field} please try again`);
}

function listPlayers(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);

  Player
    .fetchAll({ withRelated: ['teams', 'teams.coach'] })
    .then(function(players) {
      const playerPayload = typeof players.toJSON === 'function' ? players.toJSON() : players;
      const scopedPlayers = buildScopedPlayerList(playerPayload.filter(function(player) {
        return coachOwnsPlayer(player, authenticatedCoachId);
      })).map(sanitizePlayerResponse);

      res.json(scopedPlayers);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getPlayer(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);

  Player
    .where({ id: parseInt(req.params.id, 10) })
    .fetch({ withRelated: ['teams', 'teams.coach'] })
    .then(function(player) {
      if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
        return sendForbiddenError(res, 'Unauthorized');
      }

      res.json(sanitizePlayerResponse(player.toJSON()));
    })
    .catch(function(err) {
      return next(err);
    });
}

function getPlayerStats(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);

  Player
    .where({ id: req.params.id })
    .fetch({ withRelated: ['teams', 'teams.coach', 'stats'] })
    .then(function(player) {
      if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
        return sendForbiddenError(res, 'Unauthorized');
      }

      res.json(sanitizePlayerStatsResponse(player.toJSON()));
    })
    .catch(function(err) {
      return next(err);
    });
}

function updatePlayer(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);
  const updateParams = ['email', 'first_name', 'last_name', 'position'];
  for (var i = 0; i < updateParams.length; i++) {
    const confirmedParams = updateParams[i];
    if (!(confirmedParams in req.body)) {
      return sendMissingFieldError(res, confirmedParams);
    }
  }

  Player
    .where({ id: req.params.id })
    .fetch({ withRelated: ['teams', 'teams.coach'] })
    .then(function(player) {
      if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
        return sendForbiddenError(res, 'Unauthorized');
      }
      return player.save({
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        position: req.body.position
      });
    })
    .then(function(player) {
      return res.status(200).json(player);
    })
    .catch(function(err) {
      return next(err);
    });
}

function updatePlayerStat(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);
  const postParams = ['how_many'];
  for (var i = 0; i < postParams.length; i++) {
    const confirmPutParams = postParams[i];
    if (!(confirmPutParams in req.body)) {
      return sendMissingFieldError(res, confirmPutParams);
    }
  }
  Player
    .where({ id: req.params.player_id })
    .fetch({ withRelated: ['teams', 'teams.coach'] })
    .then(function(player) {
      if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
        return sendForbiddenError(res, 'Unauthorized');
      }

      return PlayerStat
        .where({
          player_id: req.params.player_id,
          stat_catalog_id: req.params.stat_catalog_id
        })
        .fetch()
        .then(function(stat) {
          return stat.save({
            how_many: req.body.how_many
          });
        });
    })
    .then(function(player) {
      if (!player || player.headersSent) {
        return null;
      }
      return res.status(200).json(player);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createPlayer(req, res, next) {
  const postParams = ['email', 'first_name', 'last_name', 'position'];
  for (var i = 0; i < postParams.length; i++) {
    const confirmPostParams = postParams[i];
    if (!(confirmPostParams in req.body)) {
      return sendMissingFieldError(res, confirmPostParams);
    }
  }

  Player
    .forge({
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      position: req.body.position
    })
    .save()
    .then(function(player) {
      return res.status(200).json(player);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createPlayerStat(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);
  const postParams = ['how_many'];
  for (var i = 0; i < postParams.length; i++) {
    const confirmPostParams = postParams[i];
    if (!(confirmPostParams in req.body)) {
      return sendMissingFieldError(res, confirmPostParams);
    }
  }
  Player
    .where({ id: req.params.player_id })
    .fetch({ withRelated: ['teams', 'teams.coach'] })
    .then(function(player) {
      if (!player || !coachOwnsPlayer(player, authenticatedCoachId)) {
        return sendForbiddenError(res, 'Unauthorized');
      }

      return PlayerStat
        .forge({
          player_id: parseInt(req.params.player_id, 10),
          stat_catalog_id: parseInt(req.params.stat_catalog_id, 10),
          how_many: req.body.how_many
        })
        .save();
    })
    .then(function(stat) {
      if (!stat || stat.headersSent) {
        return null;
      }
      return res.status(200).json(stat);
    })
    .catch(function(err) {
      return next(err);
    });
}

function deletePlayer(req, res, next) {
  const authenticatedCoachId = getAuthenticatedCoachId(req);
  const deleteParams = ['id'];
  for (var i = 0; i < deleteParams.length; i++) {
    const wrongId = deleteParams[i];
    if (!(wrongId in req.params)) {
      return sendMissingFieldError(res, wrongId);
    }
  }

  Player
    .where({
      id: parseInt(req.params.id, 10)
    })
    .fetch({ withRelated: ['teams', 'teams.coach'] })
    .then(function(player) {
      if (player && !coachOwnsPlayer(player, authenticatedCoachId)) {
        return sendForbiddenError(res, 'Unauthorized');
      }
      if (!player) {
        return sendNotFoundError(res, 'Player not found');
      }
      return player.destroy()
        .then(function() {
          return res.status(200).end();
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  listPlayers,
  getPlayer,
  getPlayerStats,
  updatePlayer,
  updatePlayerStat,
  createPlayer,
  createPlayerStat,
  deletePlayer
};
