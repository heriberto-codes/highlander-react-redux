import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import TeamDetailsComponent from './TeamDetailsComponent';

describe('TeamDetailsComponent', () => {
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

  it('builds a team-scoped game entry payload from the form inputs', () => {
    const onSubmitGameEntry = jest.fn();

    ReactDOM.render(
      <TeamDetailsComponent
        players={[
          { id: 1, first_name: 'Pat', last_name: 'Lee', email: 'pat@example.com', position: 'P' },
          { id: 2, first_name: 'Sam', last_name: 'Ray', email: 'sam@example.com', position: 'C' }
        ]}
        showGameEntryForm={true}
        onSubmitGameEntry={onSubmitGameEntry}
        onCancelGameEntry={() => {}}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    const opponentInput = div.querySelector('#game-entry-opponent');
    const dateInput = div.querySelector('#game-entry-date');
    const hitsInput = div.querySelector('[data-player-id="1"][data-stat-catalog-id="1"]');
    const strikeoutsInput = div.querySelector('[data-player-id="2"][data-stat-catalog-id="6"]');
    const form = div.querySelector('form');

    TestUtils.Simulate.change(opponentInput, { target: { value: 'Lions' } });
    TestUtils.Simulate.change(dateInput, { target: { value: '2026-03-28' } });
    TestUtils.Simulate.change(hitsInput, { target: { value: '3' } });
    TestUtils.Simulate.change(strikeoutsInput, { target: { value: '4' } });
    TestUtils.Simulate.submit(form);

    expect(onSubmitGameEntry).toHaveBeenCalledWith({
      opponent: 'Lions',
      game_date: '2026-03-28',
      playerStats: [
        {
          playerId: 1,
          stats: [
            { statCatalogId: 1, howMany: 3 },
            { statCatalogId: 2, howMany: 0 },
            { statCatalogId: 3, howMany: 0 },
            { statCatalogId: 4, howMany: 0 },
            { statCatalogId: 5, howMany: 0 },
            { statCatalogId: 6, howMany: 0 }
          ]
        },
        {
          playerId: 2,
          stats: [
            { statCatalogId: 1, howMany: 0 },
            { statCatalogId: 2, howMany: 0 },
            { statCatalogId: 3, howMany: 0 },
            { statCatalogId: 4, howMany: 0 },
            { statCatalogId: 5, howMany: 0 },
            { statCatalogId: 6, howMany: 4 }
          ]
        }
      ]
    });
  });

  it('keeps the submit button disabled until required metadata is present', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        players={[
          { id: 1, first_name: 'Pat', last_name: 'Lee', email: 'pat@example.com', position: 'P' }
        ]}
        showGameEntryForm={true}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    const opponentInput = div.querySelector('#game-entry-opponent');
    const dateInput = div.querySelector('#game-entry-date');
    const submitButton = div.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(true);

    TestUtils.Simulate.change(opponentInput, { target: { value: 'Lions' } });
    expect(submitButton.disabled).toBe(true);

    TestUtils.Simulate.change(dateInput, { target: { value: '2026-03-28' } });
    expect(submitButton.disabled).toBe(false);
  });

  it('shows a disabled saving state while a game submission is in progress', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        players={[
          { id: 1, first_name: 'Pat', last_name: 'Lee', email: 'pat@example.com', position: 'P' }
        ]}
        showGameEntryForm={true}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isSubmittingGame={true}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    const submitButton = div.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Saving...');
  });
});
