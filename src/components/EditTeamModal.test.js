import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';

import EditTeamModal from './EditTeamModal';

describe('EditTeamModal', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('submits updated team details', () => {
    const onSubmit = jest.fn();

    ReactDOM.render(
      <EditTeamModal
        team={{ name: 'Old', city: 'Bronx', state: 'NY', season: 2025 }}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
      div
    );

    Simulate.change(div.querySelector('#edit-team-name'), {
      target: { name: 'name', value: 'New Team' }
    });
    Simulate.change(div.querySelector('#edit-team-season'), {
      target: { name: 'season', value: '2026' }
    });
    Simulate.submit(div.querySelector('form'));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'New Team',
      city: 'Bronx',
      state: 'NY',
      season: 2026
    });
  });
});
