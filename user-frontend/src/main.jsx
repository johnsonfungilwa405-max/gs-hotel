import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/sections.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { CustomerProvider } from './context/CustomerContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <CustomerProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CustomerProvider>
    </ThemeProvider>
  </StrictMode>
);
