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
    expect(div.querySelector('a[href="add-player.html"]')).not.toBeNull();
    expect(div.querySelector('a[href="#"]')).not.toBeNull();
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

  it('renders an empty paginated page state when matching players exist elsewhere', () => {
    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[]}
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

    expect(div.textContent).toContain('No players on this page.');
    expect(div.textContent).toContain('Page 4 of 3');
    expect(div.querySelector('.pagination')).not.toBeNull();
    expect(div.textContent).not.toContain('You dont have a Roster.');
    expect(div.textContent).not.toContain('No players match the current filters');
  });

  it('renders roster pagination controls and requests previous and next pages', () => {
    const onPageChange = jest.fn();

    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[
          { first_name: 'Pat', email: 'pat@example.com' }
        ]}
        pagination={{
          page: 3,
          limit: 10,
          totalItems: 45,
          totalPages: 5,
          hasPreviousPage: true,
          hasNextPage: true
        }}
        onPageChange={onPageChange}
      />,
      div
    );

    const previousButton = div.querySelector('.pagination-previous');
    const nextButton = div.querySelector('.pagination-next');

    expect(div.textContent).toContain('Page 3 of 5');
    expect(previousButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);

    previousButton.click();
    nextButton.click();

    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
  });

  it('disables roster pagination controls when previous or next pages are unavailable', () => {
    const onPageChange = jest.fn();

    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[
          { first_name: 'Pat', email: 'pat@example.com' }
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
      />,
      div
    );

    const previousButton = div.querySelector('.pagination-previous');
    const nextButton = div.querySelector('.pagination-next');

    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    previousButton.click();
    nextButton.click();

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);

    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[
          { first_name: 'Pat', email: 'pat@example.com' }
        ]}
        pagination={{
          page: 3,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: false
        }}
        onPageChange={onPageChange}
      />,
      div
    );

    const lastPagePreviousButton = div.querySelector('.pagination-previous');
    const lastPageNextButton = div.querySelector('.pagination-next');

    expect(lastPagePreviousButton.disabled).toBe(false);
    expect(lastPageNextButton.disabled).toBe(true);

    lastPagePreviousButton.click();
    lastPageNextButton.click();

    expect(onPageChange).toHaveBeenCalledTimes(2);
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it('does not render roster pagination controls for a single page', () => {
    ReactDOM.render(
      <RosterList
        activeSeason={2026}
        players={[
          { first_name: 'Pat', email: 'pat@example.com' }
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
