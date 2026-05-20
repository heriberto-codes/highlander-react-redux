import React from 'react';
import ReactDOM from 'react-dom';

jest.mock('../components/Nav', () => () => <div>Nav</div>);
jest.mock('../components/RegisterForm', () => () => <div>Register Form</div>);
jest.mock('../components/Footer', () => () => <div>Footer</div>);

import Register from './Register';

describe('Register page', () => {
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

  it('renders the register page shell with nav, form, and footer', () => {
    ReactDOM.render(<Register />, div);

    expect(div.textContent).toContain('Nav');
    expect(div.textContent).toContain('Register Form');
    expect(div.textContent).toContain('Footer');
  });
});
