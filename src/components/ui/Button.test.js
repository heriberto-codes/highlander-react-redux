import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import Button from './Button';

describe('Button', () => {
	let div;

	function renderButton(element, withRouter = false) {
		ReactDOM.render(
			withRouter ? <MemoryRouter>{element}</MemoryRouter> : element,
			div
		);
	}

	beforeEach(() => {
		div = document.createElement('div');
		document.body.appendChild(div);
	});

	afterEach(() => {
		ReactDOM.unmountComponentAtNode(div);
		div.remove();
		div = null;
	});

	it('renders a native button with default type, classes, children, and click passthrough', () => {
		const handleClick = jest.fn();

		renderButton(
			<Button
				variant="primary"
				size="medium"
				isOutlined
				className="save-button"
				data-action="save"
				onClick={handleClick}
			>
				Save
			</Button>
		);

		const button = div.querySelector('button');

		expect(button).not.toBeNull();
		expect(button.type).toBe('button');
		expect(button.textContent).toBe('Save');
		expect(button.className).toContain('button');
		expect(button.className).toContain('is-primary');
		expect(button.className).toContain('is-medium');
		expect(button.className).toContain('is-outlined');
		expect(button.className).toContain('save-button');
		expect(button.getAttribute('data-action')).toBe('save');

		button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('preserves a custom native button type and disabled state', () => {
		const handleClick = jest.fn();

		renderButton(
			<Button type="submit" disabled onClick={handleClick}>
				Submit
			</Button>
		);

		const button = div.querySelector('button');

		expect(button.type).toBe('submit');
		expect(button.disabled).toBe(true);
		expect(button.className).toContain('is-disabled');

		button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(handleClick).not.toHaveBeenCalled();
	});

	it('renders an anchor when href is provided', () => {
		const handleClick = jest.fn();

		renderButton(
			<Button
				href="/external-page"
				variant="success"
				isInverted
				data-action="open"
				onClick={handleClick}
			>
				Open
			</Button>
		);

		const anchor = div.querySelector('a');

		expect(anchor).not.toBeNull();
		expect(anchor.getAttribute('href')).toBe('/external-page');
		expect(anchor.textContent).toBe('Open');
		expect(anchor.className).toContain('button');
		expect(anchor.className).toContain('is-success');
		expect(anchor.className).toContain('is-inverted');
		expect(anchor.getAttribute('data-action')).toBe('open');

		anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('prevents disabled anchor clicks', () => {
		const handleClick = jest.fn();

		renderButton(
			<Button href="/external-page" isDisabled onClick={handleClick}>
				Disabled Link
			</Button>
		);

		const anchor = div.querySelector('a');
		const clickWasNotCancelled = anchor.dispatchEvent(
			new MouseEvent('click', { bubbles: true, cancelable: true })
		);

		expect(anchor.getAttribute('aria-disabled')).toBe('true');
		expect(anchor.tabIndex).toBe(-1);
		expect(anchor.className).toContain('is-disabled');
		expect(clickWasNotCancelled).toBe(false);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it('renders a React Router link when to is provided', () => {
		renderButton(
			<Button
				to="/dashboard"
				variant="primary"
				isLight
				data-action="navigate"
			>
				Dashboard
			</Button>,
			true
		);

		const link = div.querySelector('a');

		expect(link).not.toBeNull();
		expect(link.getAttribute('href')).toBe('/dashboard');
		expect(link.textContent).toBe('Dashboard');
		expect(link.className).toContain('button');
		expect(link.className).toContain('is-primary');
		expect(link.className).toContain('is-light');
		expect(link.getAttribute('data-action')).toBe('navigate');
	});

	it('prefers React Router links over anchors when both to and href are provided', () => {
		renderButton(
			<Button to="/dashboard" href="/fallback">
				Dashboard
			</Button>,
			true
		);

		const link = div.querySelector('a');

		expect(link.getAttribute('href')).toBe('/dashboard');
	});
});
