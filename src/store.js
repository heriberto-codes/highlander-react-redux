import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { logger } from 'redux-logger';
import thunk from 'redux-thunk';
import { loginReducer } from './reducers/loginReducer';
import { coachReducer } from './reducers/coachReducer';
import { teamReducer } from './reducers/teamReducer';
// import { routerReducer, reducer as formReducer} from 'redux-form';
import { reducer as formReducer } from 'redux-form';

// const allReducers = combineReducers({
// 	loginReducer,
// 	coachReducer,
// 	teamReducer,
// 	form: formReducer,
// 	routing: routerReducer
// });

const rootReducer = combineReducers({
	loginReducer,
	coachReducer,
	teamReducer,
	form: formReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

let store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk, logger)));

export default store;
// export default routerReducer;
