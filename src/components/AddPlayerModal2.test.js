import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { reducer as formReducer } from 'redux-form';
import AddPlayer from './AddPlayerModal2';

describe('AddPlayerModal2', () => {
	let div;

	const renderAddPlayer = () => {
		const store = createStore(combineReducers({
			form: formReducer
		}));

		ReactDOM.render(
			<Provider store={store}>
				<AddPlayer />
			</Provider>,
			div
		);

		return store;
	};

	beforeEach(() => {
		div = document.createElement('div');
		document.body.appendChild(div);
	});

	afterEach(() => {
		ReactDOM.unmountComponentAtNode(div);
		div.remove();
		div = null;
	});

	it('renders the add player modal with the existing redux-form fields', () => {
		renderAddPlayer();

		expect(div.textContent).toContain('Add a Player');
		expect(div.querySelector('.modal.is-active')).not.toBeNull();
		expect(div.querySelector('input#email')).not.toBeNull();
		expect(div.querySelector('input#firstName')).not.toBeNull();
		expect(div.querySelector('input#lastName')).not.toBeNull();
		expect(div.querySelector('input#position')).not.toBeNull();
	});

	it('keeps the submit button disabled while the redux-form state is pristine', () => {
		renderAddPlayer();

		const submitButton = div.querySelector('button[type="submit"]');

		expect(submitButton).not.toBeNull();
		expect(submitButton.disabled).toBe(true);
	});
});
