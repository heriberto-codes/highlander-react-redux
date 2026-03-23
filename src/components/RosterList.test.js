import React from 'react';
import ReactDOM from 'react-dom';
import RosterList from './RosterList';

describe('RosterList', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('renders player cards and active season context', () => {
    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[
          { first_name: 'Pat', email: 'pat@example.com' },
          { first_name: 'Sam', email: 'sam@example.com' }
        ]}
      />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('Pat');
    expect(div.textContent).toContain('Sam');
  });

  it('renders the no-data empty state when there are no players', () => {
    ReactDOM.render(
      <RosterList activeSeason={2026} players={[]} />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('You dont have a Roster.');
  });

  it('renders the filtered empty state when filters remove all players', () => {
    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[]}
        filters={{
          teamSearch: '',
          playerSearch: 'Ace',
          position: ''
        }}
      />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('No players match the current filters for season 2026.');
  });
});
