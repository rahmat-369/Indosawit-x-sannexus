import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Tambahan trigger untuk PWA (Otomatis dari vite-plugin-pwa)
import { registerSW } from 'virtual:pwa-register'

// Mengaktifkan Service Worker biar PWA jalan
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
