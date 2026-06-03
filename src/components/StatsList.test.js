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
    expect(div.querySelector('a[href="add-stats.html"]')).not.toBeNull();
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

  it('renders an empty paginated page state when matching stats exist elsewhere', () => {
    ReactDOM.render(
      <StatsList
        activeSeason={2026}
        teams={[]}
        stats={[]}
        pagination={{
          page: 4,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: false
        }}
        onPageChange={jest.fn()}
      />,
      div
    );

    expect(div.textContent).toContain('No stats on this page.');
    expect(div.textContent).toContain('Page 4 of 3');
    expect(div.querySelector('.pagination')).not.toBeNull();
    expect(div.querySelector('table')).toBeNull();
    expect(div.textContent).not.toContain('You dont have Stats.');
    expect(div.textContent).not.toContain('No stats match the current filters');
  });

  it('renders stats pagination controls and requests the previous page on the last page', () => {
    const onPageChange = jest.fn();

    ReactDOM.render(
      <StatsList
        activeSeason={2026}
        teams={[]}
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
            derivedStats: {}
          }
        ]}
        pagination={{
          page: 5,
          limit: 10,
          totalItems: 45,
          totalPages: 5,
          hasPreviousPage: true,
          hasNextPage: false
        }}
        onPageChange={onPageChange}
      />,
      div
    );

    const previousButton = div.querySelector('.pagination-previous');
    const nextButton = div.querySelector('.pagination-next');

    expect(div.textContent).toContain('Page 5 of 5');
    expect(previousButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);

    previousButton.click();

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('does not render stats pagination controls for a single page', () => {
    ReactDOM.render(
      <StatsList
        activeSeason={2026}
        teams={[]}
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
            derivedStats: {}
          }
        ]}
        pagination={{
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        }}
        onPageChange={jest.fn()}
      />,
      div
    );

    expect(div.querySelector('.pagination')).toBeNull();
    expect(div.textContent).not.toContain('Page 1 of 1');
  });
});
