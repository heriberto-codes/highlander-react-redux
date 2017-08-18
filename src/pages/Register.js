import React, { Component } from 'react'

import Nav from '../components/Nav'
import RegisterForm from '../components/RegisterForm';
import Footer from '../components/Footer';

export default class Register extends Component {
  render() {
    return (
      <div>
        <Nav />
        <RegisterForm />
        <Footer />
      </div>
    )
  }
}
