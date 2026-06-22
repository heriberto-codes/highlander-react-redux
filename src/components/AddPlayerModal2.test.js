import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';

import AddPlayer from './AddPlayerModal2';

describe('AddPlayerModal2', () => {
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

	it('submits controlled player details to the team', async () => {
		const addPlayer = jest.fn(() => Promise.resolve());

		ReactDOM.render(
			<AddPlayer teamID="9" addPlayer={addPlayer} closeModal={() => {}} />,
			div
		);

		Simulate.change(div.querySelector('#playerEmail'), { target: { name: 'email', value: 'ace@example.com' } });
		Simulate.change(div.querySelector('#firstName'), { target: { name: 'firstName', value: 'Ace' } });
		Simulate.change(div.querySelector('#lastName'), { target: { name: 'lastName', value: 'Slugger' } });
		Simulate.change(div.querySelector('#playerPosition'), { target: { name: 'position', value: 'Pitcher' } });

		await act(async () => {
			Simulate.submit(div.querySelector('form'));
			await Promise.resolve();
		});

		expect(addPlayer).toHaveBeenCalledWith(
			'9',
			'ace@example.com',
			'Ace',
			'Slugger',
			'Pitcher'
		);
	});

	it('wires close and cancel controls', () => {
		const closeModal = jest.fn();

		ReactDOM.render(
			<AddPlayer teamID="9" addPlayer={() => Promise.resolve()} closeModal={closeModal} />,
			div
		);

		Simulate.click(div.querySelector('button[aria-label="close"]'));
		Simulate.click(Array.from(div.querySelectorAll('button')).find(button => button.textContent === 'Cancel'));

		expect(closeModal).toHaveBeenCalledTimes(2);
	});

	it('shows a safe error when the request fails', async () => {
		ReactDOM.render(
			<AddPlayer
				teamID="9"
				addPlayer={() => Promise.reject(new Error('database details'))}
				closeModal={() => {}}
			/>,
			div
		);

		await act(async () => {
			Simulate.submit(div.querySelector('form'));
			await Promise.resolve();
		});

		expect(div.textContent).toContain('Unable to add the player.');
		expect(div.textContent).not.toContain('database details');
	});
});
