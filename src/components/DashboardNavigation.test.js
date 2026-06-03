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

  it('preserves dashboard action link targets and labels', () => {
    ReactDOM.render(
      <DashboardNavigation
        email="coach@example.com"
        firstName="Casey"
        lastName="Jones"
      />,
      div
    );

    const linksByText = Array.from(div.querySelectorAll('a')).reduce((links, link) => {
      links[link.textContent.trim()] = link;
      return links;
    }, {});

    expect(linksByText['Add a New Team'].getAttribute('href')).toBe('add-team.html');
    expect(linksByText['Add a New Player'].getAttribute('href')).toBe('add-player.html');
    expect(linksByText['Add New Stats'].getAttribute('href')).toBe('add-stats.html');
  });
});
