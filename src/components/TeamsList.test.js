import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import TeamsList from './TeamsList';

describe('TeamsList', () => {
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

  it('renders team names with season context and active season label', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamsList
          teams={[
            { id: 1, name: 'Highlanders', season: 2026 },
            { id: 2, name: 'Warriors', season: 2026 }
          ]}
        />
      </MemoryRouter>,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('Highlanders (2026)');
    expect(div.textContent).toContain('Warriors (2026)');
  });

  it('keeps the empty state when there are no teams', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamsList teams={[]} />
      </MemoryRouter>,
      div
    );

    expect(div.textContent).toContain('You dont have any teams.');
  });

  it('renders a filtered empty state with season context when filters are active', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamsList
          teams={[]}
          activeSeason={2026}
          filters={{
            teamSearch: 'War',
            playerSearch: '',
            position: ''
          }}
        />
      </MemoryRouter>,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('No teams match the current filters for season 2026.');
  });
});
