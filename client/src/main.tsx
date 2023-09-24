import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';

import './static/css/global.css';
import './static/css/zero.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
