import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { logger } from 'redux-logger';
import thunk from 'redux-thunk';
import { loginReducer } from './reducers/loginReducer';
import { coachReducer } from './reducers/coachReducer';
import { teamReducer } from './reducers/teamReducer';


const allReducers = combineReducers({loginReducer, coachReducer, teamReducer});
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

let store = createStore(allReducers, composeEnhancers(applyMiddleware(thunk, logger)));

export default store;
