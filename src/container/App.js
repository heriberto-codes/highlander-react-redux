import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';

class App extends Component {
  render() {
    return (

      <Router>
        <div className="App">
          <Route exact path='/' component={Home} />
          <Route path='/login' component={Login} />
        </div>
      </Router>
    );
  }
}

export default App;

{/*Next steps:

Refactor the models to have the right relationship i.e http://bookshelfjs.org/#Model-instance-belongsToMany
Include routes on this page where we replace the <Home /> to use routes and redirects for the login and regaitrations page
Fix the css on the Home component

<Nav loggedIn={false}/>
<Home />
<Footer />

 */}
