import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';

import AddTeamModal from './AddTeamModal';

describe('AddTeamModal', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
  });

  it('submits controlled team details', () => {
    const onSubmit = jest.fn();

    ReactDOM.render(
      <AddTeamModal onClose={() => {}} onSubmit={onSubmit} />,
      div
    );

    Simulate.change(div.querySelector('#new-team-name'), { target: { name: 'name', value: 'Highlanders' } });
    Simulate.change(div.querySelector('#new-team-city'), { target: { name: 'city', value: 'New York' } });
    Simulate.change(div.querySelector('#new-team-state'), { target: { name: 'state', value: 'NY' } });
    Simulate.change(div.querySelector('#new-team-season'), { target: { name: 'season', value: '2026' } });
    Simulate.submit(div.querySelector('form'));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Highlanders',
      city: 'New York',
      state: 'NY',
      season: 2026
    });
  });
});
