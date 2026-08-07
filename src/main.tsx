import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { ProfileProvider } from './context/ProfileContext.tsx'
import { I18nProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ProfileProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProfileProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
