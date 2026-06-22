import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

jest.mock('axios', () => ({
  get: jest.fn()
}));

import axios from 'axios';
import PlayerDetailsModal from './PlayerDetailsModal';

describe('PlayerDetailsModal', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    axios.get.mockReset();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('loads and renders player stats', async () => {
    axios.get.mockResolvedValue({
      data: {
        id: 7,
        first_name: 'Ace',
        last_name: 'Slugger',
        email: 'ace@example.com',
        position: 'Pitcher',
        stats: [
          { id: 1, description: 'Hits', _pivot_how_many: 4 }
        ]
      }
    });

    await act(async () => {
      ReactDOM.render(<PlayerDetailsModal playerId={7} onClose={() => {}} />, div);
      await Promise.resolve();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/players/7/stats', {
      withCredentials: true
    });
    expect(div.textContent).toContain('Ace Slugger');
    expect(div.textContent).toContain('Hits');
    expect(div.textContent).toContain('4');
  });
});
