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

  it('renders the no-data empty state when there are no players', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        players={[]}
        activeSeason={2026}
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('You dont have a Roster.');
  });

  it('renders the filtered empty state when filters remove all players', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        players={[]}
        activeSeason={2026}
        filters={{
          playerSearch: 'Ace',
          position: ''
        }}
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    expect(div.textContent).toContain('Showing season 2026');
    expect(div.textContent).toContain('No players match the current filters for season 2026.');
  });

  it('renders collaborator management controls for owners and dispatches add, update, and remove actions', () => {
    const onAddCollaborator = jest.fn();
    const onUpdateCollaborator = jest.fn();
    const onRemoveCollaborator = jest.fn();

    ReactDOM.render(
      <TeamDetailsComponent
        teamId="9"
        players={[]}
        collaborators={[
          { id: 1, first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com', role: 'owner' },
          { id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }
        ]}
        currentCoachRole="owner"
        onAddCollaborator={onAddCollaborator}
        onUpdateCollaborator={onUpdateCollaborator}
        onRemoveCollaborator={onRemoveCollaborator}
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isAddingCollaborator={false}
        addCollaboratorSuccess={false}
        addCollaboratorError={null}
        isUpdatingCollaborator={false}
        updateCollaboratorSuccess={false}
        updateCollaboratorError={null}
        isRemovingCollaborator={false}
        removeCollaboratorSuccess={false}
        removeCollaboratorError={null}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    expect(div.textContent).toContain('Team Collaborators');
    expect(div.textContent).toContain('Add Collaborator');

    const coachIdInput = div.querySelector('#team-collaborator-coach-id');
    const roleSelect = div.querySelector('#team-collaborator-role');
    const addForm = coachIdInput.closest('form');
    const collaboratorRoleSelect = div.querySelector('#collaborator-role-2');
    const updateForm = collaboratorRoleSelect.closest('form');
    const removeButton = div.querySelector('[data-collaborator-remove-id="2"]');

    TestUtils.Simulate.change(coachIdInput, { target: { value: '7' } });
    TestUtils.Simulate.change(roleSelect, { target: { value: 'owner' } });
    TestUtils.Simulate.submit(addForm);

    expect(onAddCollaborator).toHaveBeenCalledWith(7, 'owner');

    TestUtils.Simulate.change(collaboratorRoleSelect, { target: { value: 'owner' } });
    TestUtils.Simulate.submit(updateForm);

    expect(onUpdateCollaborator).toHaveBeenCalledWith(2, 'owner');

    TestUtils.Simulate.click(removeButton);

    expect(onRemoveCollaborator).toHaveBeenCalledWith(2);
  });

  it('renders collaborators read-only for assistants', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        teamId="9"
        players={[]}
        collaborators={[
          { id: 1, first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com', role: 'owner' },
          { id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }
        ]}
        currentCoachRole="assistant"
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isAddingCollaborator={false}
        addCollaboratorSuccess={false}
        addCollaboratorError={null}
        isUpdatingCollaborator={false}
        updateCollaboratorSuccess={false}
        updateCollaboratorError={null}
        isRemovingCollaborator={false}
        removeCollaboratorSuccess={false}
        removeCollaboratorError={null}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    expect(div.textContent).toContain('Casey Jones');
    expect(div.textContent).toContain('Alex Smith');
    expect(div.querySelector('#team-collaborator-coach-id')).toBeNull();
    expect(div.querySelector('[data-collaborator-update-id="2"]')).toBeNull();
    expect(div.querySelector('[data-collaborator-remove-id="2"]')).toBeNull();
  });

  it('disables collaborator controls while collaborator mutations are pending', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        teamId="9"
        players={[]}
        collaborators={[
          { id: 1, first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com', role: 'owner' },
          { id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }
        ]}
        currentCoachRole="owner"
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isAddingCollaborator={true}
        addCollaboratorSuccess={false}
        addCollaboratorError={null}
        isUpdatingCollaborator={true}
        updateCollaboratorSuccess={false}
        updateCollaboratorError={null}
        isRemovingCollaborator={true}
        removeCollaboratorSuccess={false}
        removeCollaboratorError={null}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    expect(div.querySelector('#team-collaborator-coach-id').disabled).toBe(true);
    expect(div.querySelector('#team-collaborator-role').disabled).toBe(true);
    expect(div.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(div.querySelector('#collaborator-role-2').disabled).toBe(true);
    expect(div.querySelector('[data-collaborator-update-id="2"]').disabled).toBe(true);
    expect(div.querySelector('[data-collaborator-remove-id="2"]').disabled).toBe(true);
  });

  it('renders collaborator mutation feedback messages', () => {
    ReactDOM.render(
      <TeamDetailsComponent
        teamId="9"
        players={[]}
        collaborators={[
          { id: 1, first_name: 'Casey', last_name: 'Jones', email: 'coach@example.com', role: 'owner' }
        ]}
        currentCoachRole="owner"
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isAddingCollaborator={false}
        addCollaboratorSuccess={true}
        addCollaboratorError={{ message: 'add failed' }}
        isUpdatingCollaborator={false}
        updateCollaboratorSuccess={true}
        updateCollaboratorError={{ message: 'update failed' }}
        isRemovingCollaborator={false}
        removeCollaboratorSuccess={true}
        removeCollaboratorError={{ message: 'remove failed' }}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    expect(div.textContent).toContain('Collaborator added.');
    expect(div.textContent).toContain('Unable to add collaborator.');
    expect(div.textContent).toContain('Collaborator updated.');
    expect(div.textContent).toContain('Unable to update collaborator.');
    expect(div.textContent).toContain('Collaborator removed.');
    expect(div.textContent).toContain('Unable to remove collaborator.');
  });

  it('does not dispatch add collaborator for empty or non-numeric coach ids', () => {
    const onAddCollaborator = jest.fn();

    ReactDOM.render(
      <TeamDetailsComponent
        teamId="9"
        players={[]}
        collaborators={[]}
        currentCoachRole="owner"
        onAddCollaborator={onAddCollaborator}
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isAddingCollaborator={false}
        addCollaboratorSuccess={false}
        addCollaboratorError={null}
        isUpdatingCollaborator={false}
        updateCollaboratorSuccess={false}
        updateCollaboratorError={null}
        isRemovingCollaborator={false}
        removeCollaboratorSuccess={false}
        removeCollaboratorError={null}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    const coachIdInput = div.querySelector('#team-collaborator-coach-id');
    const addForm = coachIdInput.closest('form');

    TestUtils.Simulate.change(coachIdInput, { target: { value: '' } });
    TestUtils.Simulate.submit(addForm);

    TestUtils.Simulate.change(coachIdInput, { target: { value: 'abc' } });
    TestUtils.Simulate.submit(addForm);

    expect(onAddCollaborator).not.toHaveBeenCalled();
  });

  it('dispatches add collaborator for the smallest valid coach id', () => {
    const onAddCollaborator = jest.fn();

    ReactDOM.render(
      <TeamDetailsComponent
        teamId="9"
        players={[]}
        collaborators={[]}
        currentCoachRole="owner"
        onAddCollaborator={onAddCollaborator}
        showGameEntryForm={false}
        onSubmitGameEntry={() => {}}
        onCancelGameEntry={() => {}}
        isAddingCollaborator={false}
        addCollaboratorSuccess={false}
        addCollaboratorError={null}
        isUpdatingCollaborator={false}
        updateCollaboratorSuccess={false}
        updateCollaboratorError={null}
        isRemovingCollaborator={false}
        removeCollaboratorSuccess={false}
        removeCollaboratorError={null}
        isSubmittingGame={false}
        gameSubmissionSuccess={false}
        lastCreatedGame={null}
        gameSubmissionError={null}
      />,
      div
    );

    const coachIdInput = div.querySelector('#team-collaborator-coach-id');
    const addForm = coachIdInput.closest('form');

    TestUtils.Simulate.change(coachIdInput, { target: { value: '1' } });
    TestUtils.Simulate.submit(addForm);

    expect(onAddCollaborator).toHaveBeenCalledWith(1, 'assistant');
  });
});
