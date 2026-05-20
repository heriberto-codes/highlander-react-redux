import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Input from './input';

describe('Input', () => {
	let div;

	const buildProps = overrides => ({
		label: 'Player Email',
		type: 'email',
		input: {
			name: 'email',
			value: 'ace@example.com',
			onChange: jest.fn(),
			onBlur: jest.fn(),
			onFocus: jest.fn()
		},
		meta: {
			active: false,
			touched: false
		},
		...overrides
	});

	beforeEach(() => {
		div = document.createElement('div');
		document.body.appendChild(div);
	});

	afterEach(() => {
		ReactDOM.unmountComponentAtNode(div);
		div.remove();
		div = null;
	});

	it('renders the field markup and touched validation messages', () => {
		const props = buildProps({
			meta: {
				active: false,
				touched: true,
				error: 'Email required',
				warning: 'Use a current address'
			}
		});

		ReactDOM.render(<Input {...props} />, div);

		const label = div.querySelector('label');
		const input = div.querySelector('input#email');
		const warnings = div.querySelectorAll('.form-warning');

		expect(label.htmlFor).toBe('email');
		expect(label.textContent).toContain('Player Email');
		expect(input).not.toBeNull();
		expect(input.name).toBe('email');
		expect(input.value).toBe('ace@example.com');
		expect(input.type).toBe('email');
		expect(warnings).toHaveLength(2);
		expect(div.textContent).toContain('Email required');
		expect(div.textContent).toContain('Use a current address');
	});

	it('focuses the field when redux-form marks it active', () => {
		const props = buildProps();

		act(() => {
			ReactDOM.render(<Input {...props} />, div);
		});

		expect(document.activeElement).not.toBe(div.querySelector('input#email'));

		act(() => {
			ReactDOM.render(
				<Input
					{...props}
					meta={{
						...props.meta,
						active: true
					}}
				/>,
				div
			);
		});

		expect(document.activeElement).toBe(div.querySelector('input#email'));
	});

	it('renders a provided element type with the same input props', () => {
		const props = buildProps({
			element: 'textarea',
			type: undefined,
			input: {
				name: 'notes',
				value: 'Player notes',
				onChange: jest.fn(),
				onBlur: jest.fn(),
				onFocus: jest.fn()
			}
		});

		ReactDOM.render(<Input {...props} />, div);

		const textarea = div.querySelector('textarea#notes');

		expect(textarea).not.toBeNull();
		expect(textarea.name).toBe('notes');
		expect(textarea.value).toBe('Player notes');
	});
});
