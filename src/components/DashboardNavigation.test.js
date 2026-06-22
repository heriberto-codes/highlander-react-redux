import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import DashboardNavigation from './DashboardNavigation';

describe('DashboardNavigation', () => {
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
      <DashboardNavigation
        email="coach@example.com"
        firstName="Casey"
        lastName="Jones"
        activeSeason={2026}
        availableSeasons={[2026, 2025]}
        onSeasonChange={() => {}}
      />,
      div
    );

    expect(div.textContent).toContain('Active Season: 2026');
    const select = div.querySelector('#dashboard-season-select');
    expect(select).not.toBeNull();
    expect(select.value).toBe('2026');
    expect(select.className).toContain('hl-focusable');
    expect(Array.from(select.options).map(option => option.value)).toEqual(['2026', '2025']);
  });

  it('calls onSeasonChange with the selected numeric season', () => {
    const onSeasonChange = jest.fn();

    ReactDOM.render(
      <DashboardNavigation
        email="coach@example.com"
        firstName="Casey"
        lastName="Jones"
        activeSeason={2026}
        availableSeasons={[2026, 2025]}
        onSeasonChange={onSeasonChange}
      />,
      div
    );

    const select = div.querySelector('#dashboard-season-select');
    select.value = '2025';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onSeasonChange).toHaveBeenCalledWith(2025);
  });

  it('renders controlled filter inputs and applies filters on submit', () => {
    const onFilterChange = jest.fn();
    const onApplyFilters = jest.fn();

    ReactDOM.render(
      <DashboardNavigation
        email="coach@example.com"
        firstName="Casey"
        lastName="Jones"
        activeSeason={2026}
        availableSeasons={[2026, 2025]}
        teamSearch="War"
        playerSearch="Ace"
        position="Pitcher"
        onFilterChange={onFilterChange}
        onApplyFilters={onApplyFilters}
      />,
      div
    );

    const teamSearchInput = div.querySelector('#dashboard-team-search');
    const playerSearchInput = div.querySelector('#dashboard-player-search');
    const positionInput = div.querySelector('#dashboard-position-filter');
    const form = div.querySelector('form');

    expect(teamSearchInput.value).toBe('War');
    expect(playerSearchInput.value).toBe('Ace');
    expect(positionInput.value).toBe('Pitcher');
    expect(teamSearchInput.className).toContain('hl-focusable');
    expect(playerSearchInput.className).toContain('hl-focusable');
    expect(positionInput.className).toContain('hl-focusable');

    Simulate.change(teamSearchInput, { target: { name: 'teamSearch', value: 'Warriors' } });

    expect(onFilterChange).toHaveBeenCalledWith('teamSearch', 'Warriors');

    Simulate.submit(form);

    expect(onApplyFilters).toHaveBeenCalled();
  });

  it('renders coach details above the filter and action rows', () => {
    ReactDOM.render(
      <DashboardNavigation
        email="coach@example.com"
        firstName="Casey"
        lastName="Jones"
      />,
      div
    );

    const layout = div.querySelector('.dashboard-profile-layout');
    const summary = div.querySelector('.dashboard-coach-summary');
    const form = div.querySelector('.dashboard-filter-form');

    expect(layout.children[0]).toBe(summary);
    expect(layout.children[1]).toBe(form);
    expect(form.querySelector('.dashboard-filter-fields')).not.toBeNull();
    expect(form.querySelector('.dashboard-filter-actions')).not.toBeNull();
  });

  it('preserves dashboard action link targets and labels', () => {
    const onAddTeam = jest.fn();
    const onAddPlayer = jest.fn();
    const onAddStats = jest.fn();

    ReactDOM.render(
      <DashboardNavigation
        email="coach@example.com"
        firstName="Casey"
        lastName="Jones"
        onAddTeam={onAddTeam}
        onAddPlayer={onAddPlayer}
        onAddStats={onAddStats}
      />,
      div
    );

    const buttonsByText = Array.from(div.querySelectorAll('button')).reduce((buttons, button) => {
      buttons[button.textContent.trim()] = button;
      return buttons;
    }, {});

    Simulate.click(buttonsByText['Add a New Team']);
    Simulate.click(buttonsByText['Add a New Player']);
    Simulate.click(buttonsByText['Add New Stats']);

    expect(onAddTeam).toHaveBeenCalled();
    expect(onAddPlayer).toHaveBeenCalled();
    expect(onAddStats).toHaveBeenCalled();
  });
});
