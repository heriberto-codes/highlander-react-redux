import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

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
jest.mock('../components/DashboardNavigation', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));
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

import {
  Dashboard,
  getFilterStateFromProps,
  haveFilterValuesChanged,
  getPaginationStateFromProps,
  getResetPagination,
  getRequestFilters
} from './Dashboard';
import { getProfile } from '../actions/coachAction';
import DashboardNavigation from '../components/DashboardNavigation';
import TeamsList from '../components/TeamsList';
import RosterList from '../components/RosterList';
import StatsList from '../components/StatsList';

describe('Dashboard page', () => {
  let div;
  let dispatch;

  const defaultFilters = {
    teamSearch: '',
    playerSearch: '',
    position: ''
  };

  const defaultDashboardPagination = {
    teamPage: 2,
    teamLimit: 25,
    playerPage: 3,
    playerLimit: 10,
    notificationLimit: 5
  };

  const defaultProps = {
    id: 12,
    activeSeason: 2026,
    filters: defaultFilters,
    dashboardPagination: defaultDashboardPagination,
    teams: [{ id: 1, name: 'Highlanders', season: 2026 }],
    players: [{ id: 2, first_name: 'Pat' }],
    stats: [{ first_name: 'Pat', stats: {} }],
    isLoggedIn: true,
    email: 'coach@example.com',
    first_name: 'Casey',
    last_name: 'Jones',
    availableSeasons: [2026],
    teamPagination: {
      page: 2,
      limit: 25,
      totalItems: 30,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    },
    playerPagination: {
      page: 3,
      limit: 10,
      totalItems: 40,
      totalPages: 4,
      hasPreviousPage: true,
      hasNextPage: true
    }
  };

  const renderDashboard = props => {
    act(() => {
      ReactDOM.render(
        <Dashboard
          {...defaultProps}
          {...props}
          dispatch={dispatch}
        />,
        div
      );
    });
  };

  const latestDashboardNavigationProps = () =>
    DashboardNavigation.mock.calls[DashboardNavigation.mock.calls.length - 1][0];

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    dispatch = jest.fn();
    getProfile.mockClear();
    DashboardNavigation.mockClear();
    TeamsList.mockClear();
    RosterList.mockClear();
    StatsList.mockClear();
    DashboardNavigation.mockImplementation(() => null);
    TeamsList.mockImplementation(() => null);
    RosterList.mockImplementation(() => null);
    StatsList.mockImplementation(() => null);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    div = null;
  });

  it('fetches the dashboard profile on mount with current filters and pagination', () => {
    renderDashboard({
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(getProfile).toHaveBeenCalledWith(12, undefined, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 2,
      teamLimit: 25,
      playerPage: 3,
      playerLimit: 10,
      notificationLimit: 5
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('does not fetch on mount without an id, then fetches when the id appears', () => {
    renderDashboard({
      id: null,
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    expect(getProfile).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();

    renderDashboard({
      id: 12,
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(getProfile).toHaveBeenCalledWith(12, undefined, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 2,
      teamLimit: 25,
      playerPage: 3,
      playerLimit: 10,
      notificationLimit: 5
    });
  });

  it('applies dashboard filters with the active season and reset pagination', () => {
    renderDashboard();
    getProfile.mockClear();
    dispatch.mockClear();

    act(() => {
      latestDashboardNavigationProps().onFilterChange('teamSearch', 'War');
    });
    act(() => {
      latestDashboardNavigationProps().onFilterChange('playerSearch', 'Ace');
    });
    act(() => {
      latestDashboardNavigationProps().onFilterChange('position', 'Pitcher');
    });
    act(() => {
      latestDashboardNavigationProps().onApplyFilters();
    });

    expect(getProfile).toHaveBeenCalledWith(12, 2026, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 1,
      teamLimit: 25,
      playerPage: 1,
      playerLimit: 10,
      notificationLimit: 5
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('passes current dashboard filters when the season changes', () => {
    renderDashboard();
    getProfile.mockClear();
    dispatch.mockClear();

    act(() => {
      latestDashboardNavigationProps().onFilterChange('teamSearch', 'War');
    });
    act(() => {
      latestDashboardNavigationProps().onFilterChange('playerSearch', 'Ace');
    });
    act(() => {
      latestDashboardNavigationProps().onFilterChange('position', 'Pitcher');
    });
    act(() => {
      latestDashboardNavigationProps().onSeasonChange(2025);
    });

    expect(getProfile).toHaveBeenCalledWith(12, 2025, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 1,
      teamLimit: 25,
      playerPage: 1,
      playerLimit: 10,
      notificationLimit: 5
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches team page changes with current dashboard query state', () => {
    renderDashboard({
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });
    getProfile.mockClear();
    dispatch.mockClear();

    act(() => {
      TeamsList.mock.calls[TeamsList.mock.calls.length - 1][0].onPageChange(4);
    });

    expect(getProfile).toHaveBeenCalledWith(12, 2026, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 4,
      teamLimit: 25,
      playerPage: 3,
      playerLimit: 10,
      notificationLimit: 5
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches player page changes with current dashboard query state', () => {
    renderDashboard({
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });
    getProfile.mockClear();
    dispatch.mockClear();

    act(() => {
      RosterList.mock.calls[RosterList.mock.calls.length - 1][0].onPageChange(4);
    });

    expect(getProfile).toHaveBeenCalledWith(12, 2026, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 2,
      teamLimit: 25,
      playerPage: 4,
      playerLimit: 10,
      notificationLimit: 5
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite unsaved local filter edits when filter values are unchanged', () => {
    renderDashboard();

    act(() => {
      latestDashboardNavigationProps().onFilterChange('teamSearch', 'War');
    });
    act(() => {
      latestDashboardNavigationProps().onFilterChange('playerSearch', 'Ace');
    });
    act(() => {
      latestDashboardNavigationProps().onFilterChange('position', 'Pitcher');
    });

    renderDashboard({
      filters: {
        teamSearch: '',
        playerSearch: '',
        position: ''
      }
    });

    expect(latestDashboardNavigationProps()).toEqual(expect.objectContaining({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    }));
  });

  it('syncs local filter state when filter values change in props', () => {
    renderDashboard();

    act(() => {
      latestDashboardNavigationProps().onFilterChange('teamSearch', 'War');
    });

    renderDashboard({
      filters: {
        teamSearch: 'Tigers',
        playerSearch: 'Slugger',
        position: 'Catcher'
      }
    });

    expect(latestDashboardNavigationProps()).toEqual(expect.objectContaining({
      teamSearch: 'Tigers',
      playerSearch: 'Slugger',
      position: 'Catcher'
    }));
  });

  it('passes filters and activeSeason to teams, roster, and stats components', () => {
    renderDashboard({
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      }
    });

    expect(TeamsList).toHaveBeenCalledWith(expect.objectContaining({
      teams: [{ id: 1, name: 'Highlanders', season: 2026 }],
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026,
      pagination: {
        page: 2,
        limit: 25,
        totalItems: 30,
        totalPages: 2,
        hasPreviousPage: true,
        hasNextPage: false
      },
      onPageChange: expect.any(Function)
    }), expect.anything());
    expect(RosterList).toHaveBeenCalledWith(expect.objectContaining({
      players: [{ id: 2, first_name: 'Pat' }],
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026,
      pagination: {
        page: 3,
        limit: 10,
        totalItems: 40,
        totalPages: 4,
        hasPreviousPage: true,
        hasNextPage: true
      },
      onPageChange: expect.any(Function)
    }), expect.anything());
    expect(StatsList).toHaveBeenCalledWith(expect.objectContaining({
      stats: [{ first_name: 'Pat', stats: {} }],
      teams: [{ id: 1, name: 'Highlanders', season: 2026 }],
      filters: {
        teamSearch: 'War',
        playerSearch: 'Ace',
        position: 'Pitcher'
      },
      activeSeason: 2026,
      pagination: {
        page: 3,
        limit: 10,
        totalItems: 40,
        totalPages: 4,
        hasPreviousPage: true,
        hasNextPage: true
      },
      onPageChange: expect.any(Function)
    }), expect.anything());
  });
});

describe('Dashboard query-state helpers', () => {
  it('normalizes missing dashboard filters to empty strings', () => {
    expect(getFilterStateFromProps()).toEqual({
      teamSearch: '',
      playerSearch: '',
      position: ''
    });
    expect(getFilterStateFromProps({
      teamSearch: 'War'
    })).toEqual({
      teamSearch: 'War',
      playerSearch: '',
      position: ''
    });
  });

  it('detects when dashboard filter values change', () => {
    expect(haveFilterValuesChanged({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    }, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    })).toBe(false);

    expect(haveFilterValuesChanged({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    }, {
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Catcher'
    })).toBe(true);
  });

  it('normalizes partial dashboard pagination with defaults', () => {
    expect(getPaginationStateFromProps({
      teamPage: 3,
      playerLimit: 25
    })).toEqual({
      teamPage: 3,
      teamLimit: 10,
      playerPage: 1,
      playerLimit: 25,
      notificationLimit: 10
    });
  });

  it('resets team and player pages while preserving pagination limits', () => {
    expect(getResetPagination({
      teamPage: 4,
      teamLimit: 25,
      playerPage: 5,
      playerLimit: 50,
      notificationLimit: 15
    })).toEqual({
      teamPage: 1,
      teamLimit: 25,
      playerPage: 1,
      playerLimit: 50,
      notificationLimit: 15
    });
  });

  it('merges filters and pagination into profile request filters', () => {
    expect(getRequestFilters({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher'
    }, {
      teamPage: 2,
      teamLimit: 25,
      playerPage: 3,
      playerLimit: 10,
      notificationLimit: 5
    })).toEqual({
      teamSearch: 'War',
      playerSearch: 'Ace',
      position: 'Pitcher',
      teamPage: 2,
      teamLimit: 25,
      playerPage: 3,
      playerLimit: 10,
      notificationLimit: 5
    });
  });
});
