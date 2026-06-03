import React from 'react';
import ReactDOM from 'react-dom';

import SectionPanel from './SectionPanel';

describe('SectionPanel', () => {
  let div;

  function renderSectionPanel(element) {
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

  it('renders base panel classes, title, icon, actions, children, and passthrough props', () => {
    renderSectionPanel(
      <SectionPanel
        title="Roster"
        iconClassName="fa fa-users"
        actions={<button type="button">Add Player</button>}
        className="roster-panel"
        data-panel="roster"
      >
        <p>Player list</p>
      </SectionPanel>
    );

    const panel = div.querySelector('.tile');
    const heading = div.querySelector('nav');
    const icon = div.querySelector('i');
    const actionButton = div.querySelector('button');

    expect(panel).not.toBeNull();
    expect(panel.className).toContain('tile');
    expect(panel.className).toContain('is-child');
    expect(panel.className).toContain('box');
    expect(panel.className).toContain('header');
    expect(panel.className).toContain('hl-panel');
    expect(panel.className).toContain('roster-panel');
    expect(panel.getAttribute('data-panel')).toBe('roster');
    expect(heading.className).toContain('level');
    expect(heading.className).toContain('dashboard-title');
    expect(icon.className).toContain('fa');
    expect(icon.className).toContain('fa-users');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(actionButton.textContent).toBe('Add Player');
    expect(panel.textContent).toContain('Roster');
    expect(panel.textContent).toContain('Player list');
  });

  it('passes through heading and title class names', () => {
    renderSectionPanel(
      <SectionPanel
        title="Teams"
        headingClassName="teams-heading"
        titleClassName="teams-title"
      />
    );

    const heading = div.querySelector('nav');
    const title = div.querySelector('p');

    expect(heading.className).toContain('teams-heading');
    expect(title.className).toContain('teams-title');
    expect(title.textContent).toBe('Teams');
  });

  it('renders children without a heading when no heading content is provided', () => {
    renderSectionPanel(
      <SectionPanel>
        <span>Panel body only</span>
      </SectionPanel>
    );

    const panel = div.querySelector('.tile');

    expect(div.querySelector('nav')).toBeNull();
    expect(panel.textContent).toBe('Panel body only');
  });
});
