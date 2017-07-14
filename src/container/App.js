import React, { Component } from 'react';
import Nav from '../components/Nav';
import Home from '../pages/Home';
import Footer from '../components/Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Nav loggedIn={false}/>
          <Home />
          <Footer />
        </div>
      </div>
    );
  }
}

export default App;
