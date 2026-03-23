import React from 'react';
import ReactDOM from 'react-dom';
import StatsList from './StatsList';

describe('StatsList', () => {
  let div;
  let consoleErrorSpy;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
    consoleErrorSpy.mockRestore();
  });

  it('renders existing raw totals and derived stats with fixed 3-decimal formatting', () => {
    ReactDOM.render(
      <StatsList
        teams={[
          { id: 1, name: 'Highlanders', season: 2026 }
        ]}
        stats={[
          {
            first_name: 'Pat',
            last_name: 'Lee',
            position: 'Pitcher',
            stats: {
              Hits: 5,
              'At Bats': 10,
              'Home Runs': 2,
              'Earned Runs': 3,
              'Innings Pitched': 6,
              Strikeouts: 9
            },
            derivedStats: {
              battingAverage: 0.5,
              homeRunRate: 0.2,
              era: 4.5,
              strikeoutsPerInning: 1.5
            }
          }
        ]}
      />,
      div
    );

    expect(div.textContent).toContain('Pat Lee');
    expect(div.textContent).toContain('Pitcher');
    expect(div.textContent).toContain('5');
    expect(div.textContent).toContain('10');
    expect(div.textContent).toContain('2');
    expect(div.textContent).toContain('3');
    expect(div.textContent).toContain('6');
    expect(div.textContent).toContain('9');
    expect(div.textContent).toContain('0.500');
    expect(div.textContent).toContain('0.200');
    expect(div.textContent).toContain('4.500');
    expect(div.textContent).toContain('1.500');
    expect(div.textContent).toContain('Showing season 2026');
  });

  it('renders fallback placeholders for null derived stats', () => {
    ReactDOM.render(
      <StatsList
        teams={[
          { id: 1, name: 'Highlanders', season: 2026 }
        ]}
        stats={[
          {
            first_name: 'Sam',
            last_name: 'Null',
            position: 'Catcher',
            stats: {
              Hits: 2,
              'At Bats': 8,
              'Home Runs': 0,
              'Earned Runs': 0,
              'Innings Pitched': 0,
              Strikeouts: 0
            },
            derivedStats: {
              battingAverage: null,
              homeRunRate: null,
              era: null,
              strikeoutsPerInning: null
            }
          }
        ]}
      />,
      div
    );

    expect(div.textContent).toContain('Sam Null');
    expect(div.textContent.match(/--/g)).toHaveLength(4);
  });

  it('renders distinct rows for players with the same name and position', () => {
    ReactDOM.render(
      <StatsList
        teams={[
          { id: 1, name: 'Highlanders', season: 2026 }
        ]}
        stats={[
          {
            first_name: 'Chris',
            last_name: 'Smith',
            position: 'Pitcher',
            stats: {
              Hits: 5,
              'At Bats': 10,
              'Home Runs': 2,
              'Earned Runs': 3,
              'Innings Pitched': 6,
              Strikeouts: 9
            },
            derivedStats: {
              battingAverage: 0.5,
              homeRunRate: 0.2,
              era: 4.5,
              strikeoutsPerInning: 1.5
            }
          },
          {
            first_name: 'Chris',
            last_name: 'Smith',
            position: 'Pitcher',
            stats: {
              Hits: 1,
              'At Bats': 4,
              'Home Runs': 0,
              'Earned Runs': 1,
              'Innings Pitched': 2,
              Strikeouts: 3
            },
            derivedStats: {
              battingAverage: 0.25,
              homeRunRate: 0,
              era: 4.5,
              strikeoutsPerInning: 1.5
            }
          }
        ]}
      />,
      div
    );

    const rows = div.querySelectorAll('tbody tr');

    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('51023690.5000.2004.5001.500');
    expect(rows[1].textContent).toContain('1401230.2500.0004.5001.500');
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Encountered two children with the same key')
    );
  });

  it('renders the no-data empty state when there are no stats', () => {
    ReactDOM.render(
      <StatsList
        activeSeason={2026}
        teams={[]}
        stats={[]}
      />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('You dont have Stats.');
    expect(div.querySelector('table')).toBeNull();
  });

  it('renders the filtered empty state when filters remove all stats', () => {
    ReactDOM.render(
      <StatsList
        activeSeason={2026}
        teams={[]}
        stats={[]}
        filters={{
          teamSearch: '',
          playerSearch: 'Ace',
          position: ''
        }}
      />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('No stats match the current filters for season 2026.');
    expect(div.querySelector('table')).toBeNull();
  });
});
