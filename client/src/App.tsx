import { Provider } from 'react-redux';

import { store } from '~/utils/store';

export const App = () => (
  <Provider store={store}>
    <h1>привет</h1>
  </Provider>
);
