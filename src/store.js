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

export const rootReducer = combineReducers({
	loginReducer,
	coachReducer,
	teamReducer,
	form: formReducer
});

const getComposeEnhancers = () => (
	typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		: compose
);

export const createAppStore = preloadedState => {
	const composeEnhancers = getComposeEnhancers();

	return createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(thunk, logger)));
};

let store = createAppStore();

export default store;
// export default routerReducer;
