import React, { Component } from 'react';
import Hero from '../components/Hero';

export default class Home extends Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <section id="home">
        <Hero />
      </section>
    )
  }
}
