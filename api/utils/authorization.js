'use strict';

/*
 * Current authorization helpers only answer membership-style questions:
 * - which coach is authenticated
 * - whether a coach is attached to a team
 * - whether a coach can reach a player through team ownership
 *
 * Planned v1 collaboration contract for future helper expansion:
 * - collaboration remains team-scoped on the existing `coaches_teams` relation
 * - planned roles:
 *   - `owner`
 *   - `assistant`
 * - planned read rule:
 *   - any attached coach may read collaborator data for that team
 * - planned mutate rule:
 *   - only `owner` may add/remove collaborators or change collaborator roles
 * - planned guardrails:
 *   - `assistant` cannot promote self
 *   - `assistant` cannot remove an `owner`
 *   - self-removal must still preserve at least one `owner`
 *   - last-owner removal is forbidden
 *
 * This file documents the permission contract first; helper behavior will be
 * added in later implementation steps once schema support exists.
 */

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

function normalizeCoachId(candidate) {
  const coachId = Number(candidate);

  return Number.isInteger(coachId) ? coachId : null;
}

function getTeamCoaches(teamOrPayload) {
  const teamPayload = getSerializablePayload(teamOrPayload);
  return teamPayload && Array.isArray(teamPayload.coach) ? teamPayload.coach : [];
}

function getCoachRoleValue(coachOrPayload) {
  if (!coachOrPayload) {
    return null;
  }

  if (typeof coachOrPayload._pivot_role === 'string' && coachOrPayload._pivot_role.trim() !== '') {
    return coachOrPayload._pivot_role;
  }

  if (typeof coachOrPayload.role === 'string' && coachOrPayload.role.trim() !== '') {
    return coachOrPayload.role;
  }

  return null;
}

function coachBelongsToTeam(teamOrPayload, authenticatedCoachId) {
  const coaches = getTeamCoaches(teamOrPayload);
  const normalizedCoachId = normalizeCoachId(authenticatedCoachId);

  if (normalizedCoachId === null) {
    return false;
  }

  return coaches.some(function(coach) {
    return normalizeCoachId(coach && coach.id) === normalizedCoachId;
  });
}

function getCoachTeamRole(teamOrPayload, authenticatedCoachId) {
  const coaches = getTeamCoaches(teamOrPayload);
  const normalizedCoachId = normalizeCoachId(authenticatedCoachId);

  if (normalizedCoachId === null) {
    return null;
  }

  const matchingCoach = coaches.find(function(coach) {
    return normalizeCoachId(coach && coach.id) === normalizedCoachId;
  });

  return getCoachRoleValue(matchingCoach);
}

function coachIsTeamOwner(teamOrPayload, authenticatedCoachId) {
  return getCoachTeamRole(teamOrPayload, authenticatedCoachId) === 'owner';
}

function getTeamOwnerCount(teamOrPayload) {
  return getTeamCoaches(teamOrPayload).filter(function(coach) {
    return getCoachRoleValue(coach) === 'owner';
  }).length;
}

function canSafelyRemoveCoachFromTeam(teamOrPayload, targetCoachId) {
  const coaches = getTeamCoaches(teamOrPayload);
  const targetCoach = coaches.find(function(coach) {
    return Number(coach && coach.id) === Number(targetCoachId);
  });

  if (!targetCoach) {
    return false;
  }

  if (getCoachRoleValue(targetCoach) !== 'owner') {
    return true;
  }

  return getTeamOwnerCount(teamOrPayload) > 1;
}

function coachOwnsTeam(teamOrPayload, authenticatedCoachId) {
  return coachBelongsToTeam(teamOrPayload, authenticatedCoachId);
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

function coachOwnsNotification(notificationOrPayload, authenticatedCoachId) {
  const notificationPayload = getSerializablePayload(notificationOrPayload);
  const normalizedCoachId = normalizeCoachId(authenticatedCoachId);

  if (normalizedCoachId === null || !notificationPayload) {
    return false;
  }

  const directCoachId = normalizeCoachId(notificationPayload.coach_id);
  if (directCoachId !== null) {
    return directCoachId === normalizedCoachId;
  }

  if (Array.isArray(notificationPayload.coach)) {
    return notificationPayload.coach.some(function(coach) {
      return normalizeCoachId(coach && coach.id) === normalizedCoachId;
    });
  }

  const relatedCoachId = normalizeCoachId(
    notificationPayload.coach && notificationPayload.coach.id
  );

  return relatedCoachId === normalizedCoachId;
}

module.exports = {
  getAuthenticatedCoachId,
  coachBelongsToTeam,
  getCoachTeamRole,
  coachIsTeamOwner,
  canSafelyRemoveCoachFromTeam,
  coachOwnsTeam,
  coachOwnsPlayer,
  coachOwnsNotification
};
