import React, { Component } from 'react';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

export default class Login extends Component {
  constructor(props){
    super(props);
  }

  render () {
    return (
      <div>
        <Nav />
        <LoginForm />
        <Footer />
      </div>
    )
  }
}
