import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { validateClientEnv } from './utils/env-validation'

// Validate environment variables before starting the app
try {
  validateClientEnv();
} catch (error) {
  console.error('Environment validation failed:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)