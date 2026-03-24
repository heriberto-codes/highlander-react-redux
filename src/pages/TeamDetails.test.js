import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

jest.mock('../actions/teamAction', () => ({
  createTeam: jest.fn(() => ({ type: 'CREATE_TEAM_REQUEST' })),
  createGameEntry: jest.fn(() => ({ type: 'CREATE_GAME_ENTRY_REQUEST' })),
  getTeamProfile: jest.fn(() => ({ type: 'GET_TEAM_PROFILE_REQUEST' })),
  hideModal: jest.fn(() => ({ type: 'HIDE_MODAL_REQUEST' })),
  addNewPlayer: jest.fn(() => ({ type: 'ADD_NEW_PLAYER_REQUEST' })),
  addTeamCollaborator: jest.fn(() => ({ type: 'ADD_TEAM_COLLABORATOR_REQUEST' })),
  updateTeamCollaborator: jest.fn(() => ({ type: 'UPDATE_TEAM_COLLABORATOR_REQUEST' })),
  removeTeamCollaborator: jest.fn(() => ({ type: 'REMOVE_TEAM_COLLABORATOR_REQUEST' }))
}));

jest.mock('../reducers/teamReducer', () => ({
  teamReducer: jest.fn()
}));

jest.mock('../components/Nav', () => () => null);
jest.mock('../components/TeamDetailsNavigation', () => jest.fn(() => null));
jest.mock('../components/TeamDetailsComponent', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));
jest.mock('../components/AddPlayerModal2', () => () => null);

import ConnectedTeamDetails, { TeamDetails } from './TeamDetails';
import {
  getTeamProfile,
  addTeamCollaborator,
  updateTeamCollaborator,
  removeTeamCollaborator
} from '../actions/teamAction';
import TeamDetailsNavigation from '../components/TeamDetailsNavigation';
import TeamDetailsComponent from '../components/TeamDetailsComponent';

describe('TeamDetails page', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    getTeamProfile.mockClear();
    addTeamCollaborator.mockClear();
    updateTeamCollaborator.mockClear();
    removeTeamCollaborator.mockClear();
    TeamDetailsNavigation.mockClear();
    TeamDetailsComponent.mockClear();
    TeamDetailsNavigation.mockImplementation(() => null);
    TeamDetailsComponent.mockImplementation(() => null);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('applies team detail filters with the active season', () => {
    const dispatch = jest.fn();
    const page = new TeamDetails({
      match: { params: { id: '9' } },
      dispatch,
      activeSeason: 2026,
      filters: {
        playerSearch: '',
        position: ''
      }
    });

    page.state = {
      showGameEntryForm: false,
      playerSearch: 'Ace',
      position: 'Pitcher'
    };

    page.applyFilters();

    expect(getTeamProfile).toHaveBeenCalledWith('9', 2026, {
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('passes current team detail filters when the season changes', () => {
    const dispatch = jest.fn();
    const page = new TeamDetails({
      match: { params: { id: '9' } },
      dispatch,
      activeSeason: 2026,
      filters: {
        playerSearch: '',
        position: ''
      }
    });

    page.state = {
      showGameEntryForm: false,
      playerSearch: 'Ace',
      position: 'Pitcher'
    };

    page.handleSeasonChange(2025);

    expect(getTeamProfile).toHaveBeenCalledWith('9', 2025, {
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('passes filters and activeSeason to TeamDetailsComponent', () => {
    ReactDOM.render(
      <TeamDetails
        match={{ params: { id: '9' } }}
        dispatch={jest.fn()}
        activeSeason={2026}
        filters={{
          playerSearch: 'Ace',
          position: 'Pitcher'
        }}
        players={[{ id: 1, first_name: 'Pat' }]}
        collaborators={[{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }]}
        currentCoachRole="owner"
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
        showModal={false}
      />,
      div
    );

    expect(TeamDetailsComponent).toHaveBeenCalledWith(expect.objectContaining({
      teamId: '9',
      players: [{ id: 1, first_name: 'Pat' }],
      collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
      currentCoachRole: 'owner',
      filters: {
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026,
      showGameEntryForm: false,
      isSubmittingGame: false,
      gameSubmissionSuccess: false,
      lastCreatedGame: null,
      gameSubmissionError: null
    }), expect.anything());

    expect(TeamDetailsNavigation).toHaveBeenCalledWith(expect.objectContaining({
      currentCoachRole: 'owner'
    }), expect.anything());
  });

  it('dispatches collaboration actions through page helpers', () => {
    const dispatch = jest.fn();
    const page = new TeamDetails({
      match: { params: { id: '9' } },
      dispatch,
      filters: {
        playerSearch: '',
        position: ''
      }
    });

    page.addCollaborator(7, 'assistant');
    page.updateCollaborator(7, 'owner');
    page.removeCollaborator(7);

    expect(addTeamCollaborator).toHaveBeenCalledWith('9', 7, 'assistant');
    expect(updateTeamCollaborator).toHaveBeenCalledWith('9', 7, 'owner');
    expect(removeTeamCollaborator).toHaveBeenCalledWith('9', 7);
    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it('renders collaboration state from the connected store without direct prop injection', () => {
    getTeamProfile.mockReturnValueOnce({
      type: 'GET_TEAM_PROFILE_REQUEST'
    });

    const store = createStore(() => ({
      teamReducer: {
        name: 'Highlanders',
        city: 'Bronx',
        season: 2026,
        activeSeason: 2026,
        availableSeasons: [2026, 2025],
        filters: {
          playerSearch: 'Ace',
          position: 'Pitcher'
        },
        coach: {
          first_name: 'Casey',
          last_name: 'Jones',
          email: 'coach@example.com'
        },
        players: [{ id: 1, first_name: 'Pat' }],
        collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
        currentCoachRole: 'owner',
        isAddingCollaborator: true,
        addCollaboratorSuccess: false,
        addCollaboratorError: null,
        isUpdatingCollaborator: false,
        updateCollaboratorSuccess: true,
        updateCollaboratorError: null,
        isRemovingCollaborator: false,
        removeCollaboratorSuccess: false,
        removeCollaboratorError: null,
        isSubmittingGame: false,
        gameSubmissionSuccess: false,
        lastCreatedGame: null,
        gameSubmissionError: null,
        showModal: false
      }
    }), applyMiddleware(thunk));

    ReactDOM.render(
      <Provider store={store}>
        <ConnectedTeamDetails match={{ params: { id: '9' } }} />
      </Provider>,
      div
    );

    expect(TeamDetailsNavigation).toHaveBeenCalledWith(expect.objectContaining({
      currentCoachRole: 'owner'
    }), expect.anything());

    expect(TeamDetailsComponent).toHaveBeenCalledWith(expect.objectContaining({
      collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
      currentCoachRole: 'owner',
      isAddingCollaborator: true,
      updateCollaboratorSuccess: true
    }), expect.anything());
  });

  it('passes assistant collaboration state through the page render path', () => {
    ReactDOM.render(
      <TeamDetails
        match={{ params: { id: '9' } }}
        dispatch={jest.fn()}
        activeSeason={2026}
        filters={{
          playerSearch: '',
          position: ''
        }}
        players={[]}
        collaborators={[{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }]}
        currentCoachRole="assistant"
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
        showModal={false}
      />,
      div
    );

    expect(TeamDetailsNavigation).toHaveBeenCalledWith(expect.objectContaining({
      currentCoachRole: 'assistant'
    }), expect.anything());

    expect(TeamDetailsComponent).toHaveBeenCalledWith(expect.objectContaining({
      collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
      currentCoachRole: 'assistant'
    }), expect.anything());
  });
});
