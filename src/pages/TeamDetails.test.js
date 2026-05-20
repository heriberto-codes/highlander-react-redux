import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

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
jest.mock('../components/AddPlayerModal2', () => jest.fn(() => null));

import ConnectedTeamDetails, {
  TeamDetails,
  getFilterStateFromProps,
  haveFilterValuesChanged,
  getPaginationStateFromProps,
  getResetPagination,
  getFilterRequestState,
  getRequestFilters
} from './TeamDetails';
import {
  createGameEntry,
  createTeam,
  getTeamProfile,
  addNewPlayer,
  addTeamCollaborator,
  updateTeamCollaborator,
  removeTeamCollaborator
} from '../actions/teamAction';
import TeamDetailsNavigation from '../components/TeamDetailsNavigation';
import TeamDetailsComponent from '../components/TeamDetailsComponent';
import AddPlayer from '../components/AddPlayerModal2';

const defaultTeamDetailPagination = {
  playerPage: 2,
  playerLimit: 25
};

const defaultPlayerPagination = {
  page: 2,
  limit: 25,
  totalItems: 30,
  totalPages: 2,
  hasPreviousPage: true,
  hasNextPage: false
};

const defaultProps = {
  dispatch: jest.fn(),
  name: 'Highlanders',
  city: 'Bronx',
  season: 2026,
  activeSeason: 2026,
  availableSeasons: [2026, 2025],
  filters: {
    playerSearch: 'Ace',
    position: 'Pitcher'
  },
  first_name: 'Casey',
  last_name: 'Jones',
  email: 'coach@example.com',
  players: [{ id: 1, first_name: 'Pat' }],
  teamDetailPagination: defaultTeamDetailPagination,
  playerPagination: defaultPlayerPagination,
  collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
  currentCoachRole: 'owner',
  isAddingCollaborator: false,
  addCollaboratorSuccess: false,
  addCollaboratorError: null,
  isUpdatingCollaborator: false,
  updateCollaboratorSuccess: false,
  updateCollaboratorError: null,
  isRemovingCollaborator: false,
  removeCollaboratorSuccess: false,
  removeCollaboratorError: null,
  isSubmittingGame: false,
  gameSubmissionSuccess: false,
  lastCreatedGame: null,
  gameSubmissionError: null,
  showModal: false
};

describe('TeamDetails page', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    createGameEntry.mockClear();
    createTeam.mockClear();
    getTeamProfile.mockClear();
    addNewPlayer.mockClear();
    addTeamCollaborator.mockClear();
    updateTeamCollaborator.mockClear();
    removeTeamCollaborator.mockClear();
    TeamDetailsNavigation.mockClear();
    TeamDetailsComponent.mockClear();
    AddPlayer.mockClear();
    TeamDetailsNavigation.mockImplementation(() => null);
    TeamDetailsComponent.mockImplementation(() => null);
    AddPlayer.mockImplementation(() => null);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  const renderTeamDetails = (props = {}, route = '/teamdetails/9') => {
    const mergedProps = Object.assign({}, defaultProps, props);

    act(() => {
      ReactDOM.render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/teamdetails/:id" element={<TeamDetails {...mergedProps} />} />
          </Routes>
        </MemoryRouter>,
        div
      );
    });

    return mergedProps;
  };

  const latestNavigationProps = () => (
    TeamDetailsNavigation.mock.calls[TeamDetailsNavigation.mock.calls.length - 1][0]
  );

  const latestComponentProps = () => (
    TeamDetailsComponent.mock.calls[TeamDetailsComponent.mock.calls.length - 1][0]
  );

  it('fetches team profile on mount with the route id and current query state', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });

    expect(getTeamProfile).toHaveBeenCalledWith('9', undefined, {
      playerSearch: 'Ace',
      position: 'Pitcher',
      playerPage: 2,
      playerLimit: 25
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('passes current team detail filters when the season changes', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });
    getTeamProfile.mockClear();

    act(() => {
      latestNavigationProps().onFilterChange('playerSearch', 'Slugger');
      latestNavigationProps().onFilterChange('position', 'Catcher');
    });
    act(() => {
      latestNavigationProps().onSeasonChange(2025);
    });

    expect(getTeamProfile).toHaveBeenCalledWith('9', 2025, {
      playerSearch: 'Slugger',
      position: 'Catcher',
      playerPage: 1,
      playerLimit: 25
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('applies filters with the active season and reset pagination', () => {
    const dispatch = jest.fn();

    renderTeamDetails({
      dispatch,
      filters: {
        playerSearch: '',
        position: ''
      },
      teamDetailPagination: {
        playerPage: 3,
        playerLimit: 25
      }
    });
    getTeamProfile.mockClear();

    act(() => {
      latestNavigationProps().onFilterChange('playerSearch', 'Ace');
      latestNavigationProps().onFilterChange('position', 'Pitcher');
    });
    act(() => {
      latestNavigationProps().onApplyFilters();
    });

    expect(getTeamProfile).toHaveBeenCalledWith('9', 2026, {
      playerSearch: 'Ace',
      position: 'Pitcher',
      playerPage: 1,
      playerLimit: 25
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('dispatches player page changes with current team detail query state', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });
    getTeamProfile.mockClear();

    act(() => {
      latestNavigationProps().onFilterChange('playerSearch', 'Slugger');
      latestNavigationProps().onFilterChange('position', 'Catcher');
    });
    act(() => {
      latestComponentProps().onPageChange(4);
    });

    expect(getTeamProfile).toHaveBeenCalledWith('9', 2026, {
      playerSearch: 'Slugger',
      position: 'Catcher',
      playerPage: 4,
      playerLimit: 25
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('preserves unsaved local filters when filter props do not change', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });
    act(() => {
      latestNavigationProps().onFilterChange('playerSearch', 'Unsaved');
    });

    renderTeamDetails({ dispatch });

    expect(latestNavigationProps()).toEqual(expect.objectContaining({
      playerSearch: 'Unsaved',
      position: 'Pitcher'
    }));
  });

  it('syncs local filters when filter prop values change', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });
    act(() => {
      latestNavigationProps().onFilterChange('playerSearch', 'Unsaved');
    });

    renderTeamDetails({
      dispatch,
      filters: {
        playerSearch: 'Redux',
        position: 'Shortstop'
      }
    });

    expect(latestNavigationProps()).toEqual(expect.objectContaining({
      playerSearch: 'Redux',
      position: 'Shortstop'
    }));
  });

  it('closes game entry form after successful submission', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });
    act(() => {
      latestNavigationProps().showGameEntryForm();
    });

    expect(latestComponentProps()).toEqual(expect.objectContaining({
      showGameEntryForm: true
    }));

    renderTeamDetails({ dispatch, gameSubmissionSuccess: true });

    expect(latestComponentProps()).toEqual(expect.objectContaining({
      showGameEntryForm: false
    }));
  });

  it('dispatches game entry and collaboration actions with the route id', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch });
    act(() => {
      latestComponentProps().onSubmitGameEntry({ opponent: 'Rivals' });
      latestComponentProps().onAddCollaborator(7, 'assistant');
      latestComponentProps().onUpdateCollaborator(7, 'owner');
      latestComponentProps().onRemoveCollaborator(7);
    });

    expect(createGameEntry).toHaveBeenCalledWith('9', { opponent: 'Rivals' });
    expect(addTeamCollaborator).toHaveBeenCalledWith('9', 7, 'assistant');
    expect(updateTeamCollaborator).toHaveBeenCalledWith('9', 7, 'owner');
    expect(removeTeamCollaborator).toHaveBeenCalledWith('9', 7);
    expect(dispatch).toHaveBeenCalledTimes(5);
  });

  it('renders modal and dispatches player add through AddPlayer props', () => {
    const dispatch = jest.fn();

    renderTeamDetails({ dispatch, showModal: true });

    expect(AddPlayer).toHaveBeenCalledWith(expect.objectContaining({
      teamID: '9',
      addPlayer: expect.any(Function),
      closeModal: expect.any(Function)
    }), expect.anything());

    const addPlayerProps = AddPlayer.mock.calls[AddPlayer.mock.calls.length - 1][0];
    act(() => {
      addPlayerProps.addPlayer('9', 'player@example.com', 'Pat', 'Lee', 'Pitcher');
      addPlayerProps.closeModal();
    });

    expect(addNewPlayer).toHaveBeenCalledWith('9', 'player@example.com', 'Pat', 'Lee', 'Pitcher');
    expect(dispatch).toHaveBeenCalled();
  });

  it('passes collaboration state through the connected store using route params', () => {
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
        teamDetailPagination: defaultTeamDetailPagination,
        playerPagination: defaultPlayerPagination,
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

    act(() => {
      ReactDOM.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/teamdetails/9']}>
            <Routes>
              <Route path="/teamdetails/:id" element={<ConnectedTeamDetails />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
        div
      );
    });

    expect(TeamDetailsNavigation).toHaveBeenCalledWith(expect.objectContaining({
      currentCoachRole: 'owner'
    }), expect.anything());

    expect(TeamDetailsComponent).toHaveBeenCalledWith(expect.objectContaining({
      teamId: '9',
      collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
      currentCoachRole: 'owner',
      isAddingCollaborator: true,
      updateCollaboratorSuccess: true
    }), expect.anything());
  });

  it('passes assistant collaboration state through the page render path', () => {
    renderTeamDetails({
      collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
      currentCoachRole: 'assistant'
    });

    expect(TeamDetailsNavigation).toHaveBeenCalledWith(expect.objectContaining({
      currentCoachRole: 'assistant'
    }), expect.anything());

    expect(TeamDetailsComponent).toHaveBeenCalledWith(expect.objectContaining({
      collaborators: [{ id: 2, first_name: 'Alex', last_name: 'Smith', email: 'alex@example.com', role: 'assistant' }],
      currentCoachRole: 'assistant'
    }), expect.anything());
  });
});

describe('TeamDetails query-state helpers', () => {
  it('normalizes missing and provided filters', () => {
    expect(getFilterStateFromProps()).toEqual({
      playerSearch: '',
      position: ''
    });

    expect(getFilterStateFromProps({
      playerSearch: 'Ace',
      position: 'Pitcher'
    })).toEqual({
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
  });

  it('detects changed filter values', () => {
    expect(haveFilterValuesChanged({
      playerSearch: 'Ace',
      position: 'Pitcher'
    }, {
      playerSearch: 'Ace',
      position: 'Pitcher'
    })).toBe(false);

    expect(haveFilterValuesChanged({
      playerSearch: 'Ace',
      position: 'Pitcher'
    }, {
      playerSearch: 'Slugger',
      position: 'Pitcher'
    })).toBe(true);
  });

  it('normalizes and resets pagination state', () => {
    expect(getPaginationStateFromProps()).toEqual({
      playerPage: 1,
      playerLimit: 10
    });

    expect(getResetPagination({
      playerPage: 5,
      playerLimit: 25
    })).toEqual({
      playerPage: 1,
      playerLimit: 25
    });
  });

  it('builds request filters from local filter and pagination state', () => {
    expect(getFilterRequestState({
      showGameEntryForm: false,
      playerSearch: 'Ace',
      position: 'Pitcher'
    })).toEqual({
      playerSearch: 'Ace',
      position: 'Pitcher'
    });

    expect(getRequestFilters({
      playerSearch: 'Ace',
      position: 'Pitcher'
    }, {
      playerPage: 2,
      playerLimit: 25
    })).toEqual({
      playerSearch: 'Ace',
      position: 'Pitcher',
      playerPage: 2,
      playerLimit: 25
    });
  });
});
