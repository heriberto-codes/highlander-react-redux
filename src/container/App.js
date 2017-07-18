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

{/*Next steps:

Refactor the models to have the right relationship i.e http://bookshelfjs.org/#Model-instance-belongsToMany
Include routes on this page where we replace the <Home /> to use routes and redirects for the login and regaitrations page
Fix the css on the Home component */}
