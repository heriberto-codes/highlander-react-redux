import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
                                        <Routes>
                                                <Route path='/' element={<Home />} />
                                                <Route path='/login' element={<Login />} />
                                                <Route path='/register' element={<Register />} />
                                                <Route path='/dashboard' element={<Dashboard />} />
                                                <Route path='/dashboard/:id' element={<Dashboard />} />
                                                <Route path='/teamdetails/:id' element={<TeamDetails />} />
                                        </Routes>
                                </div>
                        </Router>
                );
        }
}

export default App;
