import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ✅ Full suppression of ResizeObserver loop error
if (process.env.NODE_ENV === 'development') {
    // Suppress ResizeObserver loop error via window
    window.addEventListener('error', (e) => {
        if (e.message?.includes('ResizeObserver loop')) {
            e.stopImmediatePropagation();
        }
    });

    // Suppress ResizeObserver loop error via global ResizeObserverError event
    window.addEventListener('resizeobservererror', (e) => {
        e.stopImmediatePropagation();
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);

reportWebVitals();
