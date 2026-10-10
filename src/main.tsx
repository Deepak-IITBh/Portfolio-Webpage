import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global tokens/base must load before the component stylesheets (which App pulls in), so component rules can override them.
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
