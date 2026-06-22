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
    expect(div.querySelector('a[href="/teamdetails/1"]')).not.toBeNull();
    expect(div.querySelector('a[href="/teamdetails/2"]')).not.toBeNull();
    expect(div.textContent).toContain('Add a New Team');
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

  it('renders an empty paginated page state when matching teams exist elsewhere', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamsList
          teams={[]}
          activeSeason={2026}
          pagination={{
            page: 4,
            limit: 10,
            totalItems: 25,
            totalPages: 3,
            hasPreviousPage: true,
            hasNextPage: false
          }}
          onPageChange={jest.fn()}
        />
      </MemoryRouter>,
      div
    );

    expect(div.textContent).toContain('No teams on this page.');
    expect(div.textContent).toContain('Page 4 of 3');
    expect(div.querySelector('.pagination')).not.toBeNull();
    expect(div.textContent).not.toContain('You dont have any teams.');
    expect(div.textContent).not.toContain('No teams match the current filters');
  });

  it('renders team pagination controls and requests the next page', () => {
    const onPageChange = jest.fn();

    ReactDOM.render(
      <MemoryRouter>
        <TeamsList
          teams={[
            { id: 1, name: 'Highlanders', season: 2026 }
          ]}
          pagination={{
            page: 1,
            limit: 10,
            totalItems: 25,
            totalPages: 3,
            hasPreviousPage: false,
            hasNextPage: true
          }}
          onPageChange={onPageChange}
        />
      </MemoryRouter>,
      div
    );

    const previousButton = div.querySelector('.pagination-previous');
    const nextButton = div.querySelector('.pagination-next');

    expect(div.textContent).toContain('Page 1 of 3');
    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    nextButton.click();

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('does not render team pagination controls for a single page', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamsList
          teams={[
            { id: 1, name: 'Highlanders', season: 2026 }
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
        />
      </MemoryRouter>,
      div
    );

    expect(div.querySelector('.pagination')).toBeNull();
    expect(div.textContent).not.toContain('Page 1 of 1');
  });
});
