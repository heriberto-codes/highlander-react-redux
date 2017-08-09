import React, { Component } from 'react';
import { connect } from 'react-redux';

import { login, logout } from '../actions/loginAction';


import Nav from '../components/Nav';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

// Steps
// grab credentials from the form
// create and action to hanlde the onSubmit
// send it to the reducer so create a reducer file
// send data to the store to update the state no need for a stateful object.

export default class Login extends Component {

  callLogin(email, pwd){
    console.log(email, pwd)
    this.props.dispatch(login(email, pwd))
  }

  render () {
    return (
      <div>
        <Nav />
        <LoginForm onSubmit={(email, pwd) => this.callLogin(email, pwd)} />
        <Footer />
      </div>
    )
  }
}
