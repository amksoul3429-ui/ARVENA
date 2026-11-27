import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './App.css';
import './asteria-foundation.css';
import './pwa';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

import './asteria-design-tokens.css';
import './asteria-light-workspaces.css';
