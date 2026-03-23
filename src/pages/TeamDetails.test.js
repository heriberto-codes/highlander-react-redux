import React from 'react';
import ReactDOM from 'react-dom';

jest.mock('../actions/teamAction', () => ({
  createTeam: jest.fn(() => ({ type: 'CREATE_TEAM_REQUEST' })),
  createGameEntry: jest.fn(() => ({ type: 'CREATE_GAME_ENTRY_REQUEST' })),
  getTeamProfile: jest.fn(() => ({ type: 'GET_TEAM_PROFILE_REQUEST' })),
  hideModal: jest.fn(() => ({ type: 'HIDE_MODAL_REQUEST' })),
  addNewPlayer: jest.fn(() => ({ type: 'ADD_NEW_PLAYER_REQUEST' }))
}));

jest.mock('../reducers/teamReducer', () => ({
  teamReducer: jest.fn()
}));

jest.mock('../components/Nav', () => () => null);
jest.mock('../components/TeamDetailsNavigation', () => () => null);
jest.mock('../components/TeamDetailsComponent', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));
jest.mock('../components/AddPlayerModal2', () => () => null);

import { TeamDetails } from './TeamDetails';
import { getTeamProfile } from '../actions/teamAction';
import TeamDetailsComponent from '../components/TeamDetailsComponent';

describe('TeamDetails page', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    getTeamProfile.mockClear();
    TeamDetailsComponent.mockClear();
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
  });
});
