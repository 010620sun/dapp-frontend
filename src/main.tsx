import './styles/tokens.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './app/providers';
import Home from './pages/Home';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <Home />
    </AppProviders>
  </React.StrictMode>
);
