import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { loginReducer } from './reducers/loginReducer';

// console.log(`this is the loginReducer ${loginReducer}`);
let store = createStore(loginReducer, applyMiddleware(thunk));

store.subscribe(() => {
  console.log('Store updated', store.getState())
})

export default store;
