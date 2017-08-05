import React, { Component } from 'react';

import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

export default class Login extends Component {
  // constructor(props){
  //   super(props);
  // }

  // async action happens here to dispatch action
  // callLogin(user, pwd){
  //   this.props.dispatch(login(user, pwd));
  // }

  render () {
    return (
      <div>
        <Nav />
        <LoginForm onSubmit={(user, pwd, e) => this.callLogin(user, pwd)} />
        <Footer />
      </div>
    )
  }
}
