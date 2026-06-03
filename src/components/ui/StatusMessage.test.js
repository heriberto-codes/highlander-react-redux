import React from 'react';
import ReactDOM from 'react-dom';

import StatusMessage from './StatusMessage';

describe('StatusMessage', () => {
  let div;

  function renderStatusMessage(element) {
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

  it('renders a loading message with base notification classes and passthrough props', () => {
    renderStatusMessage(
      <StatusMessage
        message="Loading profile..."
        className="profile-status"
        data-state="loading"
      />
    );

    const message = div.querySelector('.notification');

    expect(message).not.toBeNull();
    expect(message.textContent).toBe('Loading profile...');
    expect(message.className).toContain('notification');
    expect(message.className).toContain('hl-status-message');
    expect(message.className).toContain('profile-status');
    expect(message.className).not.toContain('is-success');
    expect(message.className).not.toContain('is-warning');
    expect(message.className).not.toContain('is-danger');
    expect(message.getAttribute('role')).toBeNull();
    expect(message.getAttribute('data-state')).toBe('loading');
  });

  it('renders success messages without an alert role by default', () => {
    renderStatusMessage(
      <StatusMessage variant="success" message="Saved successfully." />
    );

    const message = div.querySelector('.notification');

    expect(message.textContent).toBe('Saved successfully.');
    expect(message.className).toContain('is-success');
    expect(message.getAttribute('role')).toBeNull();
  });

  it('renders warning messages with an alert role by default', () => {
    renderStatusMessage(
      <StatusMessage variant="warning" message="Review required." />
    );

    const message = div.querySelector('.notification');

    expect(message.textContent).toBe('Review required.');
    expect(message.className).toContain('is-warning');
    expect(message.getAttribute('role')).toBe('alert');
  });

  it('renders error messages with danger styling and safe text content', () => {
    renderStatusMessage(
      <StatusMessage variant="error" message="<strong>Failed</strong>" />
    );

    const message = div.querySelector('.notification');

    expect(message.textContent).toBe('<strong>Failed</strong>');
    expect(message.innerHTML).toContain('&lt;strong&gt;Failed&lt;/strong&gt;');
    expect(message.className).toContain('is-danger');
    expect(message.getAttribute('role')).toBe('alert');
  });

  it('allows children and caller-provided role to override defaults', () => {
    renderStatusMessage(
      <StatusMessage variant="warning" message="Fallback" role="status">
        <span>Child message</span>
      </StatusMessage>
    );

    const message = div.querySelector('.notification');

    expect(message.textContent).toBe('Child message');
    expect(message.className).toContain('is-warning');
    expect(message.getAttribute('role')).toBe('status');
  });

  it('renders nothing when no message or children are provided', () => {
    renderStatusMessage(<StatusMessage variant="success" />);

    expect(div.firstChild).toBeNull();
  });
});
