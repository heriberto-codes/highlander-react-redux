import React, { Component } from 'react';

import Hero from '../components/Hero';
import Nav from '../components/Nav';
import Footer from '../components/Footer';


export default class Home extends Component {

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
