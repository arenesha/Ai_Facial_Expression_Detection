import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode removed: it runs effects twice in dev which interrupts webcam play()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
