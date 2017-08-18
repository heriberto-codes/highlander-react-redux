import { createStore, applyMiddleware, combineReducers } from 'redux';
import { logger } from 'redux-logger';
import thunk from 'redux-thunk';
import { loginReducer } from './reducers/loginReducer';
import { coachReducer } from './reducers/coachReducer';


const allReducers = combineReducers({loginReducer, coachReducer});

let store = createStore(allReducers, applyMiddleware(thunk, logger));

export default store;
