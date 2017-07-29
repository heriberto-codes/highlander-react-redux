import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path='/' component={Home} />
          <Route path='/login' component={Login} />
          <Route path='/register' component={Register} />
          <Route path='/dashboard' component={Dashboard} />
          <Route path='/dashboard/:id' component={Dashboard} />
        </div>
      </Router>
    );
  }
}

export default App;

{/*Next steps:

Include routes on this page where we replace the <Home /> to use routes and redirects for the login and regaitrations page

<Nav loggedIn={false}/>
<Home />
<Footer />

 */}
