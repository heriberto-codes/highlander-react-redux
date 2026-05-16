import { buildRequestUrl } from './queryParams';

describe('query params helpers', () => {
  it('serializes numeric pagination params with existing query params', () => {
    expect(buildRequestUrl('/api/v1/coaches/12', {
      season: 2026,
      teamPage: 2,
      teamLimit: 25,
      playerPage: 3,
      playerLimit: 10,
      notificationLimit: 5
    })).toBe('/api/v1/coaches/12?season=2026&teamPage=2&teamLimit=25&playerPage=3&playerLimit=10&notificationLimit=5');
  });

  it('omits absent and blank params while trimming strings', () => {
    expect(buildRequestUrl('/api/v1/teams/9', {
      season: undefined,
      playerSearch: '  Ace Slugger  ',
      position: '   ',
      playerPage: null,
      playerLimit: 10
    })).toBe('/api/v1/teams/9?playerSearch=Ace+Slugger&playerLimit=10');
  });
});
