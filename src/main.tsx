import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n'
import { ProfileProvider } from './context/ProfileContext.tsx'
import { ListingsProvider } from './context/ListingsContext.tsx'
import { PostsProvider } from './context/PostsContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'
import { ChatProvider } from './context/ChatContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ProfileProvider>
          <ListingsProvider>
            <PostsProvider>
              <CartProvider>
                <WishlistProvider>
                  <ChatProvider>
                    <App />
                  </ChatProvider>
                </WishlistProvider>
              </CartProvider>
            </PostsProvider>
          </ListingsProvider>
        </ProfileProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
