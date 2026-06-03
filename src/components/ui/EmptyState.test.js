import React from 'react';
import ReactDOM from 'react-dom';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  let div;

  function renderEmptyState(element) {
    ReactDOM.render(element, div);
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

  it('renders the default empty message with base notification classes', () => {
    renderEmptyState(<EmptyState />);

    const emptyState = div.querySelector('.notification');

    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toBe('No items to display.');
    expect(emptyState.className).toContain('notification');
    expect(emptyState.className).toContain('has-text-centered');
    expect(emptyState.className).toContain('hl-status-message');
  });

  it('renders a custom message with className and passthrough props', () => {
    renderEmptyState(
      <EmptyState
        message="No teams match the current filters."
        className="teams-empty-state"
        data-state="empty"
      />
    );

    const emptyState = div.querySelector('.notification');

    expect(emptyState.textContent).toBe('No teams match the current filters.');
    expect(emptyState.className).toContain('teams-empty-state');
    expect(emptyState.getAttribute('data-state')).toBe('empty');
  });

  it('renders children instead of the message when children are provided', () => {
    renderEmptyState(
      <EmptyState message="Fallback message">
        <span>No players available.</span>
      </EmptyState>
    );

    const emptyState = div.querySelector('.notification');

    expect(emptyState.textContent).toBe('No players available.');
  });

  it('renders message text safely', () => {
    renderEmptyState(<EmptyState message="<strong>No teams</strong>" />);

    const emptyState = div.querySelector('.notification');

    expect(emptyState.textContent).toBe('<strong>No teams</strong>');
    expect(emptyState.innerHTML).toContain('&lt;strong&gt;No teams&lt;/strong&gt;');
  });
});
