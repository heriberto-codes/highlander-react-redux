/**
 * @jest-environment node
 */

const {
  coachBelongsToTeam,
  getCoachTeamRole,
  coachIsTeamOwner,
  canSafelyRemoveCoachFromTeam,
  coachOwnsTeam
} = require('../api/utils/authorization');

describe('authorization helpers', () => {
  it('coachBelongsToTeam returns true when the coach is attached to the team', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'owner' },
        { id: 2, _pivot_role: 'assistant' }
      ]
    };

    expect(coachBelongsToTeam(team, 2)).toBe(true);
    expect(coachBelongsToTeam(team, 3)).toBe(false);
  });

  it('coachOwnsTeam preserves current membership-based behavior', () => {
    const team = {
      coach: [
        { id: 4, _pivot_role: 'assistant' }
      ]
    };

    expect(coachOwnsTeam(team, 4)).toBe(true);
  });

  it('getCoachTeamRole reads the role from Bookshelf pivot data', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'owner' },
        { id: 2, _pivot_role: 'assistant' }
      ]
    };

    expect(getCoachTeamRole(team, 1)).toBe('owner');
    expect(getCoachTeamRole(team, 2)).toBe('assistant');
    expect(getCoachTeamRole(team, 3)).toBeNull();
  });

  it('getCoachTeamRole also supports plain role fields from serialized payloads', () => {
    const teamModelLike = {
      toJSON: () => ({
        coach: [
          { id: 5, role: 'owner' }
        ]
      })
    };

    expect(getCoachTeamRole(teamModelLike, 5)).toBe('owner');
  });

  it('role helpers handle empty or missing coach arrays safely', () => {
    expect(coachBelongsToTeam({}, 1)).toBe(false);
    expect(getCoachTeamRole({}, 1)).toBeNull();
    expect(coachIsTeamOwner({}, 1)).toBe(false);
    expect(canSafelyRemoveCoachFromTeam({}, 1)).toBe(false);

    const emptyTeam = { coach: [] };
    expect(coachBelongsToTeam(emptyTeam, 1)).toBe(false);
    expect(getCoachTeamRole(emptyTeam, 1)).toBeNull();
    expect(coachIsTeamOwner(emptyTeam, 1)).toBe(false);
    expect(canSafelyRemoveCoachFromTeam(emptyTeam, 1)).toBe(false);
  });

  it('coachIsTeamOwner returns true only for owner role', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'owner' },
        { id: 2, _pivot_role: 'assistant' }
      ]
    };

    expect(coachIsTeamOwner(team, 1)).toBe(true);
    expect(coachIsTeamOwner(team, 2)).toBe(false);
  });

  it('unknown role strings do not grant owner access semantics', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'manager' },
        { id: 2, role: 'captain' }
      ]
    };

    expect(getCoachTeamRole(team, 1)).toBe('manager');
    expect(getCoachTeamRole(team, 2)).toBe('captain');
    expect(coachIsTeamOwner(team, 1)).toBe(false);
    expect(coachIsTeamOwner(team, 2)).toBe(false);
  });

  it('role helpers handle authenticatedCoachId type coercion consistently', () => {
    const team = {
      coach: [
        { id: 7, _pivot_role: 'owner' },
        { id: 8, _pivot_role: 'assistant' }
      ]
    };

    expect(coachBelongsToTeam(team, '7')).toBe(true);
    expect(getCoachTeamRole(team, '7')).toBe('owner');
    expect(coachIsTeamOwner(team, '7')).toBe(true);
    expect(coachBelongsToTeam(team, '8')).toBe(true);
    expect(getCoachTeamRole(team, '8')).toBe('assistant');
    expect(coachIsTeamOwner(team, '8')).toBe(false);
    expect(coachBelongsToTeam(team, 'not-a-number')).toBe(false);
    expect(getCoachTeamRole(team, 'not-a-number')).toBeNull();
    expect(coachIsTeamOwner(team, 'not-a-number')).toBe(false);
  });

  it('canSafelyRemoveCoachFromTeam rejects removing the last owner', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'owner' },
        { id: 2, _pivot_role: 'assistant' }
      ]
    };

    expect(canSafelyRemoveCoachFromTeam(team, 1)).toBe(false);
  });

  it('canSafelyRemoveCoachFromTeam allows removing an owner when another owner remains', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'owner' },
        { id: 2, _pivot_role: 'owner' },
        { id: 3, _pivot_role: 'assistant' }
      ]
    };

    expect(canSafelyRemoveCoachFromTeam(team, 1)).toBe(true);
  });

  it('canSafelyRemoveCoachFromTeam allows removing a non-owner and rejects missing coaches', () => {
    const team = {
      coach: [
        { id: 1, _pivot_role: 'owner' },
        { id: 2, _pivot_role: 'assistant' }
      ]
    };

    expect(canSafelyRemoveCoachFromTeam(team, 2)).toBe(true);
    expect(canSafelyRemoveCoachFromTeam(team, 99)).toBe(false);
  });
});
