import React, { Component } from 'react';

import Hero from '../components/Hero';
import Nav from '../components/Nav';
import Footer from '../components/Footer';


export default class Home extends Component {
  // constructor(props) {
  //   super(props);
  // }

  render(){
    return (
      <section id="home">
        <Nav loggedIn={false} />
        <Hero />
        <Footer />
      </section>
    )
  }
}
