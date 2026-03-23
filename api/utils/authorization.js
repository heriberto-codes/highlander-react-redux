'use strict';

function getAuthenticatedCoachId(req) {
  const candidate = req.authenticatedCoachId !== undefined
    ? req.authenticatedCoachId
    : req.session && req.session.coachId;
  const coachId = Number(candidate);

  return Number.isInteger(coachId) ? coachId : null;
}

function getSerializablePayload(modelOrPayload) {
  if (modelOrPayload && typeof modelOrPayload.toJSON === 'function') {
    return modelOrPayload.toJSON();
  }

  return modelOrPayload;
}

function coachOwnsTeam(teamOrPayload, authenticatedCoachId) {
  const teamPayload = getSerializablePayload(teamOrPayload);
  const coaches = teamPayload && Array.isArray(teamPayload.coach) ? teamPayload.coach : [];

  return coaches.some(function(coach) {
    return Number(coach && coach.id) === authenticatedCoachId;
  });
}

function coachOwnsPlayer(playerOrPayload, authenticatedCoachId) {
  const playerPayload = getSerializablePayload(playerOrPayload);
  const teams = playerPayload && Array.isArray(playerPayload.teams) ? playerPayload.teams : [];

  return teams.some(function(team) {
    const coaches = team && Array.isArray(team.coach) ? team.coach : [];
    return coaches.some(function(coach) {
      return Number(coach && coach.id) === authenticatedCoachId;
    });
  });
}

module.exports = {
  getAuthenticatedCoachId,
  coachOwnsTeam,
  coachOwnsPlayer
};
