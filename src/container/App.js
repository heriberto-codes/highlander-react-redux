import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import TeamDetails from '../pages/TeamDetails';

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
					<Route path='/teamdetails/:id' component={TeamDetails} />
				</div>
			</Router>
		);
	}
}

export default App;
