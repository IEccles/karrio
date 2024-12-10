import React from 'react';
import ReactDOM from 'react-dom';
import { ClientProvider } from './karrio'; // Adjust the import path as necessary
import App from './app-mode';

ReactDOM.render(
  <ClientProvider>
    <App />
  </ClientProvider>,
  document.getElementById('root')
);