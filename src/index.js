import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';

import App from './container/App';
import registerServiceWorker from './registerServiceWorker';
import './css/design-system.css';

ReactDOM.render(
        <Provider store={store}>
                <App />
        </Provider>,
        document.getElementById('root')
);
registerServiceWorker();
