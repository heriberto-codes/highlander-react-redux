/**
 * @jest-environment node
 */

const {
  normalizeNotificationPayload,
  buildUpcomingGameNotificationMessage,
  buildUpcomingGameIdempotencyKey,
  buildDueUpcomingGameNotifications
} = require('../api/utils/notifications');

describe('notification helpers', () => {
  it('normalizeNotificationPayload supports model-like payloads', () => {
    const notificationModelLike = {
      toJSON: () => ({
        id: 7,
        coach_id: 2,
        team_id: 3,
        game_id: 4,
        kind: 'upcoming_game',
        message: 'Game tomorrow',
        scheduled_for: '2026-03-27T12:00:00.000Z',
        read_at: null,
        dismissed_at: null,
        created_at: '2026-03-26T12:00:00.000Z',
        idempotency_key: 'upcoming_game:2:3:4'
      })
    };

    expect(normalizeNotificationPayload(notificationModelLike)).toEqual({
      id: 7,
      coach_id: 2,
      team_id: 3,
      game_id: 4,
      kind: 'upcoming_game',
      message: 'Game tomorrow',
      scheduled_for: '2026-03-27T12:00:00.000Z',
      read_at: null,
      dismissed_at: null,
      created_at: '2026-03-26T12:00:00.000Z',
      idempotency_key: 'upcoming_game:2:3:4'
    });
  });

  it('buildDueUpcomingGameNotifications returns upcoming-game reminders due in the next 24 hours', () => {
    const now = new Date('2026-03-26T12:00:00.000Z');
    const coach = {
      id: 2,
      teams: [
        {
          id: 3,
          name: 'Highlanders',
          games: [
            {
              id: 4,
              opponent: 'Rivals',
              game_date: '2026-03-27T08:00:00.000Z'
            },
            {
              id: 5,
              opponent: 'Far Future',
              game_date: '2026-03-29T08:00:00.000Z'
            },
            {
              id: 6,
              opponent: 'Past',
              game_date: '2026-03-26T08:00:00.000Z'
            }
          ]
        }
      ]
    };

    expect(buildDueUpcomingGameNotifications(coach, now)).toEqual([
      {
        coach_id: 2,
        team_id: 3,
        game_id: 4,
        kind: 'upcoming_game',
        message: 'Highlanders has an upcoming game against Rivals.',
        scheduled_for: new Date('2026-03-27T08:00:00.000Z'),
        idempotency_key: 'upcoming_game:2:3:4'
      }
    ]);
  });

  it('buildDueUpcomingGameNotifications skips invalid coach, team, and game data', () => {
    const now = new Date('2026-03-26T12:00:00.000Z');

    expect(buildDueUpcomingGameNotifications({}, now)).toEqual([]);
    expect(buildDueUpcomingGameNotifications({ id: 2, teams: [{ id: null, games: [] }] }, now)).toEqual([]);
    expect(buildDueUpcomingGameNotifications({
      id: 2,
      teams: [
        {
          id: 3,
          games: [
            { id: 4, game_date: 'not-a-date' }
          ]
        }
      ]
    }, now)).toEqual([]);
  });

  it('buildDueUpcomingGameNotifications includes a game exactly 24 hours away and excludes one just beyond it', () => {
    const now = new Date('2026-03-26T12:00:00.000Z');
    const coach = {
      id: 2,
      teams: [
        {
          id: 3,
          name: 'Highlanders',
          games: [
            {
              id: 4,
              opponent: 'Boundary In',
              game_date: '2026-03-27T12:00:00.000Z'
            },
            {
              id: 5,
              opponent: 'Boundary Out',
              game_date: '2026-03-27T12:00:00.001Z'
            }
          ]
        }
      ]
    };

    expect(buildDueUpcomingGameNotifications(coach, now)).toEqual([
      {
        coach_id: 2,
        team_id: 3,
        game_id: 4,
        kind: 'upcoming_game',
        message: 'Highlanders has an upcoming game against Boundary In.',
        scheduled_for: new Date('2026-03-27T12:00:00.000Z'),
        idempotency_key: 'upcoming_game:2:3:4'
      }
    ]);
  });

  it('buildDueUpcomingGameNotifications creates one idempotency key per coach-team-game tuple across multiple due games', () => {
    const now = new Date('2026-03-26T12:00:00.000Z');
    const coach = {
      id: 2,
      teams: [
        {
          id: 3,
          name: 'Highlanders',
          games: [
            {
              id: 4,
              opponent: 'Rivals',
              game_date: '2026-03-27T08:00:00.000Z'
            },
            {
              id: 5,
              opponent: 'Falcons',
              game_date: '2026-03-27T09:00:00.000Z'
            }
          ]
        },
        {
          id: 8,
          name: 'Highlanders JV',
          games: [
            {
              id: 9,
              opponent: 'Owls',
              game_date: '2026-03-27T10:00:00.000Z'
            }
          ]
        }
      ]
    };

    const notifications = buildDueUpcomingGameNotifications(coach, now);

    expect(notifications).toHaveLength(3);
    expect(notifications.map(notification => notification.idempotency_key)).toEqual([
      'upcoming_game:2:3:4',
      'upcoming_game:2:3:5',
      'upcoming_game:2:8:9'
    ]);
  });

  it('exposes stable message and idempotency key builders', () => {
    expect(buildUpcomingGameNotificationMessage(
      { name: 'Highlanders' },
      { opponent: 'Rivals' }
    )).toBe('Highlanders has an upcoming game against Rivals.');

    expect(buildUpcomingGameIdempotencyKey(2, 3, 4)).toBe('upcoming_game:2:3:4');
  });
});
