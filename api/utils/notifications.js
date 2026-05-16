'use strict';

function getSerializablePayload(modelOrPayload) {
  if (modelOrPayload && typeof modelOrPayload.toJSON === 'function') {
    return modelOrPayload.toJSON();
  }

  return modelOrPayload;
}

function normalizeInteger(value) {
  const normalizedValue = Number(value);

  return Number.isInteger(normalizedValue) ? normalizedValue : null;
}

function parseDate(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function normalizeNotificationPayload(notificationOrPayload) {
  const notification = getSerializablePayload(notificationOrPayload);

  if (!notification) {
    return null;
  }

  return {
    id: normalizeInteger(notification.id),
    coach_id: normalizeInteger(notification.coach_id),
    team_id: normalizeInteger(notification.team_id),
    game_id: normalizeInteger(notification.game_id),
    kind: typeof notification.kind === 'string' ? notification.kind : null,
    message: typeof notification.message === 'string' ? notification.message : null,
    scheduled_for: notification.scheduled_for || null,
    read_at: notification.read_at || null,
    dismissed_at: notification.dismissed_at || null,
    created_at: notification.created_at || null,
    idempotency_key: typeof notification.idempotency_key === 'string'
      ? notification.idempotency_key
      : null
  };
}

function buildUpcomingGameNotificationMessage(team, game) {
  const teamName = team && typeof team.name === 'string' && team.name.trim() !== ''
    ? team.name.trim()
    : 'Your team';
  const opponent = game && typeof game.opponent === 'string' && game.opponent.trim() !== ''
    ? game.opponent.trim()
    : 'an upcoming opponent';

  return `${teamName} has an upcoming game against ${opponent}.`;
}

function buildUpcomingGameIdempotencyKey(coachId, teamId, gameId) {
  return `upcoming_game:${coachId}:${teamId}:${gameId}`;
}

function buildDueUpcomingGameNotifications(coachOrPayload, currentTime = new Date()) {
  const coachPayload = getSerializablePayload(coachOrPayload);
  const coachId = normalizeInteger(coachPayload && coachPayload.id);
  const now = parseDate(currentTime);

  if (coachId === null || !now) {
    return [];
  }

  const reminderWindowEndsAt = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  const teams = coachPayload && Array.isArray(coachPayload.teams) ? coachPayload.teams : [];

  return teams.reduce(function(notificationRows, team) {
    const teamId = normalizeInteger(team && team.id);
    const games = team && Array.isArray(team.games) ? team.games : [];

    if (teamId === null) {
      return notificationRows;
    }

    games.forEach(function(game) {
      const gameId = normalizeInteger(game && game.id);
      const gameDate = parseDate(game && game.game_date);

      if (gameId === null || !gameDate) {
        return;
      }

      if (gameDate <= now || gameDate > reminderWindowEndsAt) {
        return;
      }

      notificationRows.push({
        coach_id: coachId,
        team_id: teamId,
        game_id: gameId,
        kind: 'upcoming_game',
        message: buildUpcomingGameNotificationMessage(team, game),
        scheduled_for: gameDate,
        idempotency_key: buildUpcomingGameIdempotencyKey(coachId, teamId, gameId)
      });
    });

    return notificationRows;
  }, []);
}

module.exports = {
  normalizeNotificationPayload,
  buildUpcomingGameNotificationMessage,
  buildUpcomingGameIdempotencyKey,
  buildDueUpcomingGameNotifications
};
