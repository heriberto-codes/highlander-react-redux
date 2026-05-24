jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

import { createAppStore, rootReducer } from './store';

describe('store setup', () => {
  it('combines the expected app reducers', () => {
    const state = rootReducer(undefined, { type: '@@TEST/INIT' });

    expect(Object.keys(state).sort()).toEqual([
      'coachReducer',
      'form',
      'loginReducer',
      'teamReducer'
    ]);
  });

  it('creates an app store with preloaded state and thunk middleware', () => {
    const preloadedState = {
      loginReducer: {
        isLoading: false,
        isloggedIn: true,
        hasResolvedSession: true,
        shouldRedirect: false,
        errorMessage: null
      },
      coachReducer: {
        coachProfile: { id: 3 },
        teams: []
      },
      teamReducer: {
        teamProfile: { id: 7 },
        players: []
      },
      form: {}
    };
    const store = createAppStore(preloadedState);

    expect(store.getState()).toEqual(preloadedState);
    expect(store.dispatch(() => 'thunk-result')).toBe('thunk-result');
  });
});
