import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import TeamDetailsNavigation from './TeamDetailsNavigation';

describe('TeamDetailsNavigation', () => {
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

  it('renders active season context and season selector options', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamDetailsNavigation
          name="Highlander"
          city="Bronx"
          first_name="Casey"
          last_name="Jones"
          email="coach@example.com"
          activeSeason={2026}
          availableSeasons={[2026, 2025]}
          currentCoachRole="owner"
          onSeasonChange={() => {}}
          showModal={() => {}}
          showGameEntryForm={() => {}}
        />
      </MemoryRouter>,
      div
    );

    expect(div.textContent).toContain('Active Season: 2026');
    expect(div.textContent).not.toContain('Collaboration Role');
    const select = div.querySelector('#team-details-season-select');
    expect(select).not.toBeNull();
    expect(select.value).toBe('2026');
    expect(select.className).toContain('hl-focusable');
    expect(Array.from(select.options).map(option => option.value)).toEqual(['2026', '2025']);
  });

  it('renders controlled filter inputs and applies filters on submit', () => {
    const onFilterChange = jest.fn();
    const onApplyFilters = jest.fn();

    ReactDOM.render(
      <MemoryRouter>
        <TeamDetailsNavigation
          name="Highlander"
          city="Bronx"
          first_name="Casey"
          last_name="Jones"
          email="coach@example.com"
          activeSeason={2026}
          availableSeasons={[2026, 2025]}
          playerSearch="Ace"
          position="Pitcher"
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          showModal={() => {}}
          showGameEntryForm={() => {}}
        />
      </MemoryRouter>,
      div
    );

    const playerSearchInput = div.querySelector('#team-details-player-search');
    const positionInput = div.querySelector('#team-details-position-filter');
    const form = div.querySelector('form');

    expect(playerSearchInput.value).toBe('Ace');
    expect(positionInput.value).toBe('Pitcher');
    expect(playerSearchInput.className).toContain('hl-focusable');
    expect(positionInput.className).toContain('hl-focusable');

    Simulate.change(playerSearchInput, { target: { name: 'playerSearch', value: 'Slugger' } });

    expect(onFilterChange).toHaveBeenCalledWith('playerSearch', 'Slugger');

    Simulate.submit(form);

    expect(onApplyFilters).toHaveBeenCalled();
  });

  it('renders search fields above season and action buttons', () => {
    ReactDOM.render(
      <MemoryRouter>
        <TeamDetailsNavigation
          name="Highlander"
          activeSeason={2026}
          availableSeasons={[2026]}
          showModal={() => {}}
          showGameEntryForm={() => {}}
        />
      </MemoryRouter>,
      div
    );

    const form = div.querySelector('.team-details-filter-form');
    expect(form.children[0].className).toBe('team-details-filter-fields');
    expect(form.children[1].className).toBe('team-details-filter-actions');
    expect(form.children[1].querySelector('#team-details-season-select')).not.toBeNull();
  });

  it('calls onSeasonChange with the selected numeric season', () => {
    const onSeasonChange = jest.fn();

    ReactDOM.render(
      <MemoryRouter>
        <TeamDetailsNavigation
          name="Highlander"
          city="Bronx"
          first_name="Casey"
          last_name="Jones"
          email="coach@example.com"
          activeSeason={2026}
          availableSeasons={[2026, 2025]}
          onSeasonChange={onSeasonChange}
          showModal={() => {}}
          showGameEntryForm={() => {}}
        />
      </MemoryRouter>,
      div
    );

    const select = div.querySelector('#team-details-season-select');
    select.value = '2025';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onSeasonChange).toHaveBeenCalledWith(2025);
  });

  it('preserves action callbacks', () => {
    const showModal = jest.fn();
    const showGameEntryForm = jest.fn();
    const onEditTeam = jest.fn();

    ReactDOM.render(
      <MemoryRouter>
        <TeamDetailsNavigation
          name="Highlander"
          city="Bronx"
          first_name="Casey"
          last_name="Jones"
          email="coach@example.com"
          activeSeason={2026}
          availableSeasons={[2026, 2025]}
          showModal={showModal}
          showGameEntryForm={showGameEntryForm}
          onEditTeam={onEditTeam}
        />
      </MemoryRouter>,
      div
    );

    const buttonsByText = Array.from(div.querySelectorAll('button')).reduce((buttons, button) => {
      buttons[button.textContent.trim()] = button;
      return buttons;
    }, {});
    expect(buttonsByText['Add New Player'].type).toBe('button');
    expect(buttonsByText['Add Game Stats'].type).toBe('button');
    expect(buttonsByText['Edit Team'].type).toBe('button');

    Simulate.click(buttonsByText['Add New Player']);
    Simulate.click(buttonsByText['Add Game Stats']);
    Simulate.click(buttonsByText['Edit Team']);

    expect(showModal).toHaveBeenCalled();
    expect(showGameEntryForm).toHaveBeenCalled();
    expect(onEditTeam).toHaveBeenCalled();
  });
});
