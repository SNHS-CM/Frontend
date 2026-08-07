import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ListingsProvider } from './context/ListingsContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'
import { ChatProvider } from './context/ChatContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ListingsProvider>
        <CartProvider>
          <WishlistProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </WishlistProvider>
        </CartProvider>
      </ListingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
