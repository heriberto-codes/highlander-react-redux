import React from 'react';
import ReactDOM from 'react-dom';
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
});
