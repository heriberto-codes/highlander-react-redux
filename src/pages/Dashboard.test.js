import React from 'react';
import ReactDOM from 'react-dom';

jest.mock('../actions/coachAction', () => ({
  getProfile: jest.fn(() => ({ type: 'GET_PROFILE_REQUEST' })),
  profileSuccess: jest.fn(),
  profileError: jest.fn()
}));

jest.mock('../reducers/coachReducer', () => ({
  coachReducer: jest.fn()
}));

jest.mock('../reducers/loginReducer', () => ({
  loginReducer: jest.fn()
}));

jest.mock('../components/Nav', () => () => null);
jest.mock('../components/DashboardNavigation', () => () => null);
jest.mock('../components/TeamsList', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));
jest.mock('../components/RosterList', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));
jest.mock('../components/StatsList', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));

import { Dashboard } from './Dashboard';
import { getProfile } from '../actions/coachAction';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

describe('Dashboard page', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    getProfile.mockClear();
    TeamsList.mockClear();
    RosterList.mockClear();
    StatsList.mockClear();
    TeamsList.mockImplementation(() => null);
    RosterList.mockImplementation(() => null);
    StatsList.mockImplementation(() => null);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('applies dashboard filters with the active season', () => {
    const dispatch = jest.fn();
    const dashboard = new Dashboard({
      id: 12,
      dispatch,
      activeSeason: 2026,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    dashboard.state = {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    };

    dashboard.applyFilters();

    expect(getProfile).toHaveBeenCalledWith(12, 2026, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('passes current dashboard filters when the season changes', () => {
    const dispatch = jest.fn();
    const dashboard = new Dashboard({
      id: 12,
      dispatch,
      activeSeason: 2026,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    dashboard.state = {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    };

    dashboard.handleSeasonChange(2025);

    expect(getProfile).toHaveBeenCalledWith(12, 2025, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('does not overwrite unsaved local filter edits when filter values are unchanged', () => {
    const dashboard = new Dashboard({
      id: 12,
      dispatch: jest.fn(),
      activeSeason: 2026,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    dashboard.state = {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    };
    dashboard.setState = update => {
      dashboard.state = { ...dashboard.state, ...update };
    };

    dashboard.props = {
      ...dashboard.props,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    };

    dashboard.componentDidUpdate({
      ...dashboard.props,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    expect(dashboard.state).toEqual({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    });
  });

  it('syncs local filter state when filter values change in props', () => {
    const dashboard = new Dashboard({
      id: 12,
      dispatch: jest.fn(),
      activeSeason: 2026,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    dashboard.state = {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    };
    dashboard.setState = update => {
      dashboard.state = { ...dashboard.state, ...update };
    };

    dashboard.props = {
      ...dashboard.props,
      filters: {
        teamSearch: 'Tigers',
        playerSearch: 'Slugger',
        position: 'Catcher'
      }
    };

    dashboard.componentDidUpdate({
      ...dashboard.props,
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    expect(dashboard.state).toEqual({
      teamSearch: 'Tigers',
      playerSearch: 'Slugger',
      position: 'Catcher'
    });
  });

  it('passes filters and activeSeason to teams, roster, and stats components', () => {
    ReactDOM.render(
      <Dashboard
        id={12}
        dispatch={jest.fn()}
        activeSeason={2026}
        filters={{
          teamSearch: 'War',
          playerSearch: 'Ace',
          position: 'Pitcher'
        }}
        teams={[{ id: 1, name: 'Highlanders', season: 2026 }]}
        players={[{ id: 2, first_name: 'Pat' }]}
        stats={[{ first_name: 'Pat', stats: {} }]}
        isLoggedIn={true}
        email="coach@example.com"
        first_name="Casey"
        last_name="Jones"
        availableSeasons={[2026]}
      />,
      div
    );

    expect(TeamsList).toHaveBeenCalledWith(expect.objectContaining({
      teams: [{ id: 1, name: 'Highlanders', season: 2026 }],
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026
    }), expect.anything());
    expect(RosterList).toHaveBeenCalledWith(expect.objectContaining({
      players: [{ id: 2, first_name: 'Pat' }],
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026
    }), expect.anything());
    expect(StatsList).toHaveBeenCalledWith(expect.objectContaining({
      stats: [{ first_name: 'Pat', stats: {} }],
      teams: [{ id: 1, name: 'Highlanders', season: 2026 }],
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026
    }), expect.anything());
  });
});
